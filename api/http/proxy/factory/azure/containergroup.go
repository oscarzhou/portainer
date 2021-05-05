package azure

import (
	"errors"
	"net/http"

	portainer "github.com/portainer/portainer/api"
	"github.com/portainer/portainer/api/http/proxy/factory/responseutils"
)

// proxy for /subscriptions/*/resourceGroups/*/providers/Microsoft.ContainerInstance/containerGroups/*
func (transport *Transport) proxyContainerGroupRequest(request *http.Request) (*http.Response, error) {
	switch request.Method {
	case http.MethodPut:
		return transport.proxyContainerGroupPutRequest(request)
	case http.MethodGet:
		return transport.proxyContainerGroupGetRequest(request)
	case http.MethodDelete:
		return transport.proxyContainerGroupDeleteRequest(request)
	default:
		return http.DefaultTransport.RoundTrip(request)
	}
}

func (transport *Transport) proxyContainerGroupPutRequest(request *http.Request) (*http.Response, error) {
	//add a lock before processing existense check
	transport.mutex.Lock()
	defer transport.mutex.Unlock()

	//generate a temp http GET request based on the current PUT request
	validationRequest := &http.Request{
		Method: http.MethodGet,
		URL:    request.URL,
		Header: http.Header{
			"Authorization": []string{request.Header.Get("Authorization")},
		},
	}

	//fire the request to Azure API to validate if there is an existing container instance with the same name
	//positive - reject the request
	//negative - continue the process
	if validationResponse, err := http.DefaultTransport.RoundTrip(validationRequest); err == nil && validationResponse.StatusCode/100 == 2 {
		return nil, errors.New("Container instance already exists")
	}

	response, err := http.DefaultTransport.RoundTrip(request)
	if err != nil {
		return response, err
	}

	responseObject, err := responseutils.GetResponseAsJSONObject(response)
	if err != nil {
		return response, err
	}

	containerGroupID, ok := responseObject["id"].(string)
	if !ok {
		return response, errors.New("Missing container group ID")
	}

	context, err := transport.createAzureRequestContext(request)
	if err != nil {
		return response, err
	}

	resourceControl, err := transport.createPrivateResourceControl(containerGroupID, portainer.ContainerGroupResourceControl, context.userID)
	if err != nil {
		return response, err
	}

	responseObject = decorateObject(responseObject, resourceControl)

	err = responseutils.RewriteResponse(response, responseObject, http.StatusOK)
	if err != nil {
		return response, err
	}

	return response, nil
}

func (transport *Transport) proxyContainerGroupGetRequest(request *http.Request) (*http.Response, error) {
	response, err := http.DefaultTransport.RoundTrip(request)
	if err != nil {
		return response, err
	}

	responseObject, err := responseutils.GetResponseAsJSONObject(response)
	if err != nil {
		return nil, err
	}

	context, err := transport.createAzureRequestContext(request)
	if err != nil {
		return nil, err
	}

	responseObject = transport.decorateContainerGroup(responseObject, context)

	responseutils.RewriteResponse(response, responseObject, http.StatusOK)

	return response, nil
}

func (transport *Transport) proxyContainerGroupDeleteRequest(request *http.Request) (*http.Response, error) {
	context, err := transport.createAzureRequestContext(request)
	if err != nil {
		return nil, err
	}

	if !transport.userCanDeleteContainerGroup(request, context) {
		return responseutils.WriteAccessDeniedResponse()
	}

	response, err := http.DefaultTransport.RoundTrip(request)
	if err != nil {
		return response, err
	}

	responseObject, err := responseutils.GetResponseAsJSONObject(response)
	if err != nil {
		return nil, err
	}

	transport.removeResourceControl(responseObject, context)

	responseutils.RewriteResponse(response, responseObject, http.StatusOK)

	return response, nil
}

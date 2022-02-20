package demo

import (
	"github.com/pkg/errors"
	portainer "github.com/portainer/portainer/api"
	"github.com/portainer/portainer/api/dataservices"
)

func initDemoUser(
	store dataservices.DataStore,
	cryptoService portainer.CryptoService,
) error {

	password, err := cryptoService.Hash("tryportainer")
	if err != nil {
		return errors.WithMessage(err, "failed creating password hash")
	}

	admin := &portainer.User{
		Username: "admin",
		Password: password,
		Role:     portainer.AdministratorRole,
	}

	err = store.User().Create(admin)
	return errors.WithMessage(err, "failed creating user")
}

func initDemoLocalEndpoint(store dataservices.DataStore) error {
	localEndpoint := &portainer.Endpoint{
		ID:        portainer.EndpointID(1),
		Name:      "local",
		URL:       "unix:///var/run/docker.sock",
		PublicURL: "demo.portainer.io",
		Type:      portainer.DockerEnvironment,
		GroupID:   portainer.EndpointGroupID(1),
		TLSConfig: portainer.TLSConfiguration{
			TLS: false,
		},
		AuthorizedUsers:    []portainer.UserID{},
		AuthorizedTeams:    []portainer.TeamID{},
		UserAccessPolicies: portainer.UserAccessPolicies{},
		TeamAccessPolicies: portainer.TeamAccessPolicies{},
		TagIDs:             []portainer.TagID{},
		Status:             portainer.EndpointStatusUp,
		Snapshots:          []portainer.DockerSnapshot{},
		Kubernetes:         portainer.KubernetesDefault(),
	}

	err := store.Endpoint().Create(localEndpoint)
	return errors.WithMessage(err, "failed creating swarm endpoint")
}

func initDemoSettings(
	store dataservices.DataStore,
) error {
	settings, err := store.Settings().Settings()
	if err != nil {
		return errors.WithMessage(err, "failed fetching settings")
	}

	settings.EnableTelemetry = false

	err = store.Settings().UpdateSettings(settings)
	return errors.WithMessage(err, "failed updating settings")
}

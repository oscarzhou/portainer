package demo

import (
	"log"

	"github.com/pkg/errors"
	portainer "github.com/portainer/portainer/api"
	"github.com/portainer/portainer/api/dataservices"
)

type environmentDetails struct {
	Enabled      bool
	Users        []portainer.UserID
	Environments []portainer.EndpointID
}

type Service struct {
	details environmentDetails
}

func NewService() *Service {
	return &Service{}
}

func (service *Service) Init(store dataservices.DataStore, cryptoService portainer.CryptoService) error {
	log.Print("[INFO] [main] Starting demo environment")

	err := initDemoUser(store, cryptoService)
	if err != nil {
		return errors.WithMessage(err, "failed creating demo user")
	}

	err = initDemoLocalEndpoint(store)
	if err != nil {
		return errors.WithMessage(err, "failed creating demo endpoint")
	}

	err = initDemoSettings(store)
	if err != nil {
		return errors.WithMessage(err, "failed updating demo settings")
	}

	service.details = environmentDetails{
		Enabled: true,
		Users:   []portainer.UserID{1},
		// endpoints 2,3 are created after deployment of portainer
		Environments: []portainer.EndpointID{1, 2, 3},
	}

	return nil
}

func (service *Service) IsDemo() bool {
	return service.details.Enabled
}

func (service *Service) IsDemoEnvironment(environmentID portainer.EndpointID) bool {
	if !service.IsDemo() {
		return false
	}

	for _, demoEndpointID := range service.details.Environments {
		if environmentID == demoEndpointID {
			return true
		}
	}

	return false
}

func (service *Service) IsDemoUser(userID portainer.UserID) bool {
	if !service.IsDemo() {
		return false
	}

	for _, demoUserID := range service.details.Users {
		if userID == demoUserID {
			return true
		}
	}

	return false
}

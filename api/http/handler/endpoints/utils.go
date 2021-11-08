package endpoints

import portainer "github.com/portainer/portainer/api"

func isDemoEnvironment(demoEnvironmentIDs []portainer.EndpointID, environmentID portainer.EndpointID) bool {
	for _, demoEndpointID := range demoEnvironmentIDs {
		if environmentID == demoEndpointID {
			return true
		}
	}

	return false
}

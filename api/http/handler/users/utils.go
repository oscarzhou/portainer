package users

import portainer "github.com/portainer/portainer/api"

func isDemoUser(demoUserIDs []portainer.UserID, userID portainer.UserID) bool {
	for _, demoUserID := range demoUserIDs {
		if userID == demoUserID {
			return true
		}
	}

	return false
}

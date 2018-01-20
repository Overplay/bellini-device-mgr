#Improvements Needed

- A game could have a UUID and then when a connect occurs, if the player is in that game and had been temporarily disconnected, they could be reconnected.

- The gets from the model for things like `whiteCardsPlayed` are synchronous and rely on the assumption that the model was loaded by a previous view. This hsould be changed to promises.

define('templates/server', [], function() {
  const DEFAULT_SERVER_TEMPLATE = `# Server Script runs only on Hosted server & not in test mode
# KrunkScript Copyright (C) FRVR Limited
# 
# Add custom actions here

# Runs when the game starts
public action start() {

}

# Runs every game tick
public action update(num delta) {

}

# Player spawns in
public action onPlayerSpawn(str id) {

}

# Player died
public action onPlayerDeath(str id, str killerID) {

}

# Player got damaged
public action onPlayerDamage(str id, str doerID, num amount) {

}

# Player update
public action onPlayerUpdate(str id, num delta, obj inputs) {

}

# Called from Custom Trigger Action
public action onCustomTrigger(str playerID, str customParam, num value) {

}

# Should trigger a trigger? Return true or false
public bool action shouldTrigger(str playerID, str triggerID, str customParam) {
    return true;
}

# Server receives network message
public action onNetworkMessage(str id, obj data, str playerID) {

}

# Server receives chat message
public action onChatMessage(str msg, str playerID) {

}

# When a player leaves the server
public action onPlayerLeave(str playerID) {

}

# Runs when the round ends
public action onGameEnd() {

}

# When a player finished a video
public action onAdFinished(str playerID, bool success) {

}

# Runs when the server closes
public action onServerClosed() {

}

# When a deposit box is changed
public action onDepositBoxChange(str objectID, str playerID, num amount, num finalAmount) {

}
`;

  return DEFAULT_SERVER_TEMPLATE;
});

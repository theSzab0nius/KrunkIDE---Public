define('templates/client', [], function() {
  const DEFAULT_CLIENT_TEMPLATE = `# Client Script runs only on the client
# KrunkScript Copyright (C) FRVR Limited
# 
# Add custom actions here

# Runs when the game starts
public action start() {

}

# Runs every game tick
public action update(num delta) {

}

# Add rendering logic in here
public action render(num delta) {

}

# Player spawns in
public action onPlayerSpawn(str id) {

}

# Player died
public action onPlayerDeath(str id, str killerID) {

}

# Player update
public action onPlayerUpdate(str id, num delta, obj inputs) {

}

# User pressed a key
public action onKeyPress(str key, num code) {

}

# User released a key
public action onKeyUp(str key, num code) {

}

# User held a key
public action onKeyHeld(str key, num code) {

}

# User pressed a button on a controller
public action onControllerPress(str key, num code) {

}

# User released a button on a controller
public action onControllerUp(str key, num code) {

}

# User held a button on a controller
public action onControllerHeld(str key, num code) {

}

# User clicked on screen
public action onMouseClick(num button, num x, num y) {

}

# User released clicked on screen
public action onMouseUp(num button, num x, num y) {

}

# User scrolled on screen
public action onMouseScroll(num dir) {

}

# User clicked a DIV (ID)
public action onDIVClicked(str id) {

}

# Client receives network message
public action onNetworkMessage(str id, obj data) {

}
`;

  return DEFAULT_CLIENT_TEMPLATE;
});

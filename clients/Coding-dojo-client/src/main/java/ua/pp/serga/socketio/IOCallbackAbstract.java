package ua.pp.serga.socketio;

import java.util.logging.Level;
import java.util.logging.Logger;

public abstract class IOCallbackAbstract implements IOCallback {
    static final Logger logger = Logger.getLogger("io.callbackAbstract");

    @Override
    public void onDisconnect() {
        logger.log(Level.INFO, "Connection was terminated");
    }

    @Override
    public void onConnect() {
        logger.log(Level.INFO, "Connected to server");
    }

    @Override
    public void onMessage(String data, IOAcknowledge ack) {
        logger.log(Level.INFO, "Message received from server");
    }

    @Override
    public void on(String event, IOAcknowledge ack, Object... args) {
        logger.log(Level.INFO, "Server triggered event '" + event + "'");
    }

    @Override
    public void onError(SocketIOException socketIOException) {
        logger.log(Level.WARNING, "Error event was invoked");
    }
}

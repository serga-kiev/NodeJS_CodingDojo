/*
 * io.socket.io-java-client IOAcknowledge.java
 *
 * Copyright (c) 2012, Enno Boland
 * PROJECT DESCRIPTION
 * 
 * See LICENSE file for more information
 */
package ua.pp.serga.socketio;

/**
 * The Interface IOAcknowledge.
 */
public interface IOAcknowledge {
	
	/**
	 * Acknowledges a io.socket.io message.
	 *
	 * @param args may be all types which can be serialized by {@link org.json.JSONArray#put(Object)}
	 */
	void ack(Object... args);
}

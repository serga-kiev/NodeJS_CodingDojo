/*
 * io.socket.io-java-client IOMessage.java
 *
 * Copyright (c) 2012, Enno Boland
 * io.socket.io-java-client is a implementation of the io.socket.io protocol in Java.
 * 
 * See LICENSE file for more information
 */
package ua.pp.serga.socketio;

import java.util.Arrays;
import java.util.Iterator;

/**
 * The Class IOMessage.
 */
class IOMessage {

	/** Message type disconnect */
	public static final int TYPE_DISCONNECT = 0;

	/** Message type connect */
	public static final int TYPE_CONNECT = 1;

	/** Message type heartbeat */
	public static final int TYPE_HEARTBEAT = 2;

	/** Message type message */
	public static final int TYPE_MESSAGE = 3;

	/** Message type JSON message */
	public static final int TYPE_JSON_MESSAGE = 4;

	/** Message type event */
	public static final int TYPE_EVENT = 5;

	/** Message type acknowledge */
	public static final int TYPE_ACK = 6;

	/** Message type error */
	public static final int TYPE_ERROR = 7;

	/** Message type noop */
	public static final int TYPE_NOOP = 8;

	/** Index of the type field in a message */
	public static final int FIELD_TYPE = 0;

	/** Index of the id field in a message */
	public static final int FIELD_ID = 1;

	/** Index of the endpoint field in a message */
	public static final int FIELD_ENDPOINT = 2;

	/** Index of the data field in a message */
	public static final int FIELD_DATA = 3;

	/** Number of fields in a message. */
	public static final int NUM_FIELDS = 4;

	/** The field values */
	String[] fields = new String[NUM_FIELDS];

	/** Type */
	int type;
	
	/**
	 * Instantiates a new IOMessage by given data.
	 * 
	 * @param type
	 *            the type
	 * @param id
	 *            the id
	 * @param namespace
	 *            the namespace
	 * @param data
	 *            the data
	 */
	public IOMessage(int type, String id, String namespace, String data) {
		this.fields[FIELD_ID] = id;
		this.fields[FIELD_TYPE] = "" + type;
		this.type = type;
		this.fields[FIELD_ENDPOINT] = namespace;
		this.fields[FIELD_DATA] = data;
	}

	/**
	 * Instantiates a new IOMessage by given data.
	 * 
	 * @param type
	 *            the type
	 * @param namespace
	 *            the namespace
	 * @param data
	 *            the data
	 */
	public IOMessage(int type, String namespace, String data) {
		this(type, null, namespace, data);
	}

	/**
	 * Instantiates a new IOMessage from a String representation. If the String
	 * is not well formated, the result is undefined.
	 * 
	 * @param message
	 *            the message
	 */
	public IOMessage(String message) {
		String[] fields = message.split(":", NUM_FIELDS);
		for (int i = 0; i < fields.length; i++) {
			this.fields[i] = fields[i];
			if(i == FIELD_TYPE)
				this.type = Integer.parseInt(fields[i]);
		}
	}

	/**
	 * Generates a String representation of this object.
	 */
	@Override
	public String toString() {
		StringBuilder builder = new StringBuilder();
		Iterator<String> i = Arrays.asList(fields).iterator();
		while(i.hasNext()) {
			String field = i.next();
			if (field != null)
				builder.append(field);
			if(i.hasNext())
				builder.append(':');
		}
		return builder.toString();
	}

	/**
	 * Returns the type of this IOMessage.
	 * 
	 * @return the type
	 */
	public int getType() {
		return type;
	}

	/**
	 * Returns the id of this IOMessage.
	 * 
	 * @return the id
	 */
	public String getId() {
		return fields[FIELD_ID];
	}

	/**
	 * Sets the id of this IOMessage
	 * 
	 * @param id
	 */
	public void setId(String id) {
		fields[FIELD_ID] = id;
	}

	/**
	 * Returns the endpoint of this IOMessage.
	 * 
	 * @return the endpoint
	 */
	public String getEndpoint() {
		return fields[FIELD_ENDPOINT];
	}

	/**
	 * Returns the data of this IOMessage.
	 * 
	 * @return the data
	 */
	public String getData() {
		return fields[FIELD_DATA];
	}

}

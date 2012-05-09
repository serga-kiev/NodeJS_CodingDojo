package ua.pp.serga;

import org.json.JSONException;
import org.json.JSONObject;
import ua.pp.serga.socketio.IOAcknowledge;
import ua.pp.serga.socketio.IOCallbackAbstract;
import ua.pp.serga.socketio.SocketIO;

import javax.script.ScriptEngine;
import javax.script.ScriptEngineManager;
import javax.script.ScriptException;
import java.io.*;
import java.net.MalformedURLException;
import java.util.Properties;
import java.util.logging.Level;
import java.util.logging.Logger;

public class SocketIOClientImplementation extends IOCallbackAbstract {
    private SocketIO socket;
    private static final String CONNECTION_PROTOCOL = "http";
    private static String USER_ID;
    private static String USER_NAME;
    private static String GAME_PASS;
    private static String SERVER_CONNECTION_STRING;

    static final Logger logger = Logger.getLogger("socketIOLogger");

    public SocketIOClientImplementation() {
        socket = new SocketIO();
        try {
            socket.connect(SERVER_CONNECTION_STRING, this);
        } catch (MalformedURLException e) {
            logger.warning("Malformed URL!");
            e.printStackTrace();
        }
        socket.emit("userGreet", USER_ID);
    }

    public static void main(String[] args) {
        try {
            logger.log(Level.INFO, "Main method invoked");
            initPropertiesVariables();
            new SocketIOClientImplementation();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private static void initPropertiesVariables() {
        try {
            InputStream inputStream = new FileInputStream("src\\main\\resources\\dojo-client.properties");
            Properties props = new Properties();
            props.load(inputStream);
            USER_ID = props.getProperty("user_id");
            //logger.log(Level.INFO, "USER ID: " + USER_ID);
            USER_NAME = props.getProperty("user_name");
            GAME_PASS = props.getProperty("game_pass");
            SERVER_CONNECTION_STRING =
                    CONNECTION_PROTOCOL + "://" + props.getProperty("server_ip") + ":" + props.getProperty("server_port");
        } catch (FileNotFoundException e) {
            e.printStackTrace();
            logger.log(Level.WARNING, "Unable to open .properties file!");
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    private JSONObject generateJSONAnswer(JSONObject quest) {
        ScriptEngineManager scriptEngineManager = new ScriptEngineManager();
        ScriptEngine scriptEngine = scriptEngineManager.getEngineByName("JavaScript");
        String answer;
        String evalExpression;
        try {
            evalExpression = (String) quest.get("message");
            answer = scriptEngine.eval(evalExpression).toString();
            logger.log(Level.INFO, "The answer to the question is: " + answer);
            quest.put("message", answer);
        } catch (ScriptException e) {
            logger.log(Level.WARNING, "Cannot evaluate question received from server!");
            e.printStackTrace();
        } catch (JSONException e) {
            logger.log(Level.WARNING, "Server question is incorrect");
            e.printStackTrace();
        }
        return quest;
    }

    @Override
    public void onMessage(JSONObject json, IOAcknowledge ack) {
        try {
            if (json.get("event").equals("questionFromServer")) {
                logger.log(Level.INFO, "Server said:" + json.toString(2));
                JSONObject jsonAnswer = generateJSONAnswer(json);
                socket.send(json);
            } else {
                logger.log(Level.WARNING, "Received from server message is incorrect");
            }
        } catch (JSONException e) {
            e.printStackTrace();
        }
    }

    /*    public static void createFile() throws IOException {
        Properties properties = new Properties();
        File file = new File("myprops.properties");
        file.createNewFile();
        logger.log(Level.INFO, file.getAbsolutePath());
        OutputStream outputStream;
        try {
            outputStream = new FileOutputStream(file);
            properties.setProperty("hellj", "value");
            properties.store(outputStream, "");
        } catch (FileNotFoundException e) {
            e.printStackTrace();  //To change body of catch statement use File | Settings | File Templates.
        } catch (IOException e) {
            e.printStackTrace();  //To change body of catch statement use File | Settings | File Templates.
        }

    }*/
}
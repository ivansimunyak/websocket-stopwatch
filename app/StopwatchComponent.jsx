import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';

const StopwatchComponent = () => {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [serverStartHour, setServerStartHour] = useState(0);
  const [serverStartMinute, setServerStartMinute] = useState(0);
  const [serverStartSecond, setServerStartSecond] = useState(0);
  const [running, setRunning] = useState(false);
  const stompClientRef = useRef(null);
  const wsUrl = 'http://192.168.1.11:8080/stopwatch-websocket';

  useEffect(() => {
    const socket = new SockJS(wsUrl);
    const stompClient = Stomp.over(() => socket);
    stompClientRef.current = stompClient;
    stompClient.connect({}, () => {
      console.log('Connected to WebSocket server');

      // Subscribe to start topic
      stompClient.subscribe('/topic/start', (message) => {
        const data = JSON.parse(message.body);
        console.log('Received start message:', data);
    
        const now = new Date();
        const currentHours = now.getHours();
        const currentMinutes = now.getMinutes();
        const currentSeconds = now.getSeconds();
    
        // Calculate total seconds for server start time and current time
        const serverStartTotalSeconds = data.hours * 3600 + data.minutes * 60 + data.seconds;
        let currentTotalSeconds = currentHours * 3600 + currentMinutes * 60 + currentSeconds;
    
        // // Adjust current time if it's earlier than server start time
        // if (currentTotalSeconds < serverStartTotalSeconds) {
        //     currentTotalSeconds += 24 * 3600; // Add 24 hours to current time
        // }
    
        // Calculate elapsed time in seconds
        let elapsedTotalSeconds = currentTotalSeconds - serverStartTotalSeconds;
    
        // Calculate elapsed hours, minutes, seconds
        let elapsedHours = Math.floor(elapsedTotalSeconds / 3600);
        let remainingSeconds = elapsedTotalSeconds % 3600;
        let elapsedMinutes = Math.floor(remainingSeconds / 60);
        let elapsedSeconds = remainingSeconds % 60;
    
        console.log("Elapsed time:", elapsedHours, "hours", elapsedMinutes, "minutes", elapsedSeconds, "seconds");
    
        // Update state
        setRunning(data.running);
    });
    

      // Subscribe to stop topic
      stompClient.subscribe('/topic/stop', (message) => {
        const data = JSON.parse(message.body);
        console.log('Received stop message:', data);
        setRunning(data.running)
        // Handle stop message
        // You can update your local state or UI here
      });

      // Subscribe to reset topic
      stompClient.subscribe('/topic/reset', (message) => {
        const data = JSON.parse(message.body);
        console.log('Received reset message:', data);
        setServerStartHour(data.hours);
        setServerStartMinute(data.minutes);
        setServerStartSecond(data.seconds);
        setElapsedTime(0);
        setRunning(data.running)
        // Handle reset message
        // You can update your local state or UI here
      });

      // Request the current state by sending a start message
    });

  }, [wsUrl]); // Add elapsedTime as a dependency

  const startLocalTimer = () => {
  };

  const handleStart = () => {
    // Get current time
    if (stompClientRef.current && stompClientRef.current.connected) {
      stompClientRef.current.send('/app/start', {}, JSON.stringify({}));
    }
  };

  const handleStop = () => {
    if (stompClientRef.current && stompClientRef.current.connected) {
      stompClientRef.current.send('/app/stop', {}, JSON.stringify({}));
    }
  };

  const handleReset = () => {
    if (stompClientRef.current && stompClientRef.current.connected) {
      stompClientRef.current.send('/app/reset', {}, JSON.stringify({}));
    }
  };

  const formatTime = (elapsedSeconds) => {
    // Convert elapsed seconds back to hours, minutes, and seconds
    const elapsedHours = Math.floor(elapsedSeconds / 3600);
    elapsedSeconds %= 3600;
    const elapsedMinutes = Math.floor(elapsedSeconds / 60);
    const elapsedRemainingSeconds = elapsedSeconds % 60;
    return `${elapsedHours.toString().padStart(2, '0')}:${elapsedMinutes.toString().padStart(2, '0')}:${elapsedRemainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.timeText}>{elapsedTime}</Text>

      <TouchableOpacity style={styles.button} onPress={running ? handleStop : handleStart}>
        <Text style={styles.buttonText}>{running ? 'Stop' : 'Start'}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={handleReset}>
        <Text style={styles.buttonText}>Reset</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1F1F1F',
  },
  timeText: {
    fontSize: 48,
    color: '#FFFFFF',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 8,
    marginVertical: 10,
    width: 100,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default StopwatchComponent;

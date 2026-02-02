import React, { useState, useEffect, useRef } from 'react';
import './VideoCallSection.css';

const VideoCallSection = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [participantCount, setParticipantCount] = useState(2);
  const [callDuration, setCallDuration] = useState(0);
  const [showChatPanel, setShowChatPanel] = useState(true);
  const [userRole, setUserRole] = useState('patient');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [remoteVideoOn, setRemoteVideoOn] = useState(true);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const messagesEndRef = useRef(null);
  const callTimerRef = useRef(null);

  const emojis = ['😊', '👍', '❤️', '😂', '🎉', '🙏', '😢', '😍', '🤔', '😎', '🔥', '💪'];

  useEffect(() => {
    initLocalStream();
    
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    callTimerRef.current = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
    return () => {
      if (callTimerRef.current) clearInterval(callTimerRef.current);
    };
  }, []);

  const initLocalStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing media devices:', error);
      alert('Unable to access camera and microphone. Please check permissions.');
    }
  };

  const handleSendMessage = (text = newMessage) => {
    if (text.trim()) {
      const message = {
        id: Date.now(),
        sender: userRole,
        text: text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, message]);
      setNewMessage('');
    }
  };

  const addEmoji = (emoji) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const toggleVideo = () => {
    const videoTrack = localVideoRef.current?.srcObject?.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setIsVideoOn(!isVideoOn);
    }
  };

  const toggleAudio = () => {
    const audioTrack = localVideoRef.current?.srcObject?.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setIsAudioOn(!isAudioOn);
    }
  };

  const toggleScreenShare = () => {
    setIsScreenSharing(!isScreenSharing);
  };

  const toggleRemoteVideo = () => {
    setRemoteVideoOn(!remoteVideoOn);
  };

  const handleEndCall = () => {
    const videoTrack = localVideoRef.current?.srcObject?.getVideoTracks()[0];
    const audioTrack = localVideoRef.current?.srcObject?.getAudioTracks()[0];
    if (videoTrack) videoTrack.stop();
    if (audioTrack) audioTrack.stop();
    window.location.reload();
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs > 0 ? hrs + ':' : ''}${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const otherRole = userRole === 'patient' ? 'Doctor' : 'Patient';

  return (
    <div className="video-call-container">
      <div className="main-content">
        <div className="video-section">
          <div className="call-header">
            <div className="call-info">
              <span className="status-indicator"></span>
              <span className="status-text">Medical Consultation • {participantCount} Participants</span>
            </div>
            <div className="role-badge">{userRole.toUpperCase()}</div>
            <div className="call-timer">{formatTime(callDuration)}</div>
            <button className="minimize-chat" onClick={() => setShowChatPanel(!showChatPanel)} title="Toggle chat">
              💬
            </button>
          </div>

          <div className="video-grid">
            {/* Local Video */}
            <div className="video-container local-video">
              <video
                ref={localVideoRef}
                autoPlay
                muted
                className="video-element"
              />
              <div className="video-label">
                <span className="role-name">You ({userRole})</span>
              </div>
              {!isVideoOn && <div className="video-off-overlay">📷 Camera Off</div>}
            </div>

            {/* Remote Video */}
            <div className="video-container remote-video">
              {remoteVideoOn ? (
                <>
                  <div className="remote-placeholder">
                    <div className="placeholder-avatar">👨‍⚕️</div>
                    <p>Available Doctor</p>
                  </div>
                </>
              ) : (
                <div className="video-off-overlay remote">📷 Camera Off</div>
              )}
              <div className="video-label remote">
                <span className="role-name">{otherRole}</span>
              </div>
            </div>
          </div>
          
          <div className="controls">
            <div className="control-group">
              <button 
                onClick={toggleVideo} 
                className={`control-button ${isVideoOn ? 'active' : 'inactive'}`}
                title={isVideoOn ? 'Turn off camera' : 'Turn on camera'}
              >
                {isVideoOn ? '📹' : '❌'}
                <span>Camera</span>
              </button>
              <button 
                onClick={toggleAudio} 
                className={`control-button ${isAudioOn ? 'active' : 'inactive'}`}
                title={isAudioOn ? 'Mute' : 'Unmute'}
              >
                {isAudioOn ? '🎙️' : '🔇'}
                <span>Audio</span>
              </button>
              <button 
                onClick={toggleScreenShare} 
                className={`control-button ${isScreenSharing ? 'active' : ''}`}
                title="Share screen"
              >
                🖥️
                <span>Screen</span>
              </button>
              <button 
                onClick={toggleRemoteVideo} 
                className={`control-button ${remoteVideoOn ? 'active' : 'inactive'}`}
                title="Toggle remote video"
              >
                👥
                <span>Remote</span>
              </button>
            </div>
            <button 
              onClick={handleEndCall} 
              className="control-button end-call"
              title="End consultation"
            >
              ☎️
              <span>End Call</span>
            </button>
          </div>
        </div>
        
        {showChatPanel && (
          <div className="chat-section">
            <div className="chat-header">
              <h3>💬 Medical Chat</h3>
              <span className="chat-participants">{participantCount} in consultation</span>
            </div>

            <div className="messages-container">
              {messages.length === 0 && (
                <div className="empty-chat">
                  <p>💭 No messages yet</p>
                  <span>Start the consultation chat</span>
                </div>
              )}
              {messages.map((msg) => (
                <div key={msg.id} className={`message-bubble ${msg.sender === userRole ? 'own-message' : 'other-message'}`}>
                  <div className="message-sender">
                    {msg.sender === 'patient' ? '👤' : '👨‍⚕️'} <strong>{msg.sender}</strong>
                  </div>
                  <div className="message-text">{msg.text}</div>
                  <div className="message-time">{msg.timestamp}</div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="message-input-wrapper">
              {showEmojiPicker && (
                <div className="emoji-picker">
                  {emojis.map(emoji => (
                    <button
                      key={emoji}
                      className="emoji-btn"
                      onClick={() => addEmoji(emoji)}
                      title={emoji}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
              <div className="message-input-container">
                <input
                  type="text"
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="message-input"
                />
                <button
                  className="emoji-toggle"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  title="Add emoji"
                >
                  😊
                </button>
                <button 
                  onClick={() => handleSendMessage()} 
                  className="send-button"
                  title="Send message"
                >
                  ➤
                </button>
              </div>
            </div>

            {/* Role Selector */}
            <div className="role-selector">
              <label>View as:</label>
              <div className="role-buttons">
                <button 
                  className={`role-btn ${userRole === 'patient' ? 'active' : ''}`}
                  onClick={() => setUserRole('patient')}
                >
                  👤 Patient
                </button>
                <button 
                  className={`role-btn ${userRole === 'doctor' ? 'active' : ''}`}
                  onClick={() => setUserRole('doctor')}
                >
                  👨‍⚕️ Doctor
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoCallSection;

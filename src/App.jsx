import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import React, { useRef, useState, useEffect } from 'react';
import Input from '@material-ui/core/Input';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    padding: theme.spacing(2),
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: 'center',
    color: theme.palette.text.secondary,
  },
  camera: {
    display: (props) => (props.showCamera ? 'block' : 'none'),
  },
  screen: {
    display: (props) => (props.showScreen ? 'block' : 'none'),
  },
}));
const type = {
  webm: 'video/webm',
};
function App() {
  const cameraRef = useRef(null);
  const screenRef = useRef(null);
  const [showCamera, setShowCamera] = useState(true);
  const [showScreen, setShowScreen] = useState(true);
  const classes = useStyles({ showCamera, showScreen });
  const [hasStarted, setHasStarted] = useState(false);
  const [cameraAudioBitsPerSecond, setCameraAudioBitsPerSecond] = useState(12800);
  const [cameraVideoBitsPerSecond, setCameraVideoBitsPerSecond] = useState(254000 * 5);
  const [screenAudioBitsPerSecond, setScreenAudioBitsPerSecond] = useState(254000 * 5);
  const cameraRecorderRef = useRef(null);
  const camereStreamRef = useRef(null);
  const screenRecorderRef = useRef(null);
  const screenStreamRef = useRef(null);
  const cameraChunksRef = useRef([]);
  const screenChunksRef = useRef([]);
  const [isRecording, setIsRecording] = useState(false);
  const saveCameraMedia = (blob) => {
    const audioURL = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = audioURL;
    link.download = 'camera.webm';
    link.click();
    URL.revokeObjectURL(link.href);
  };
  const saveScreenMedia = (blob) => {
    const audioURL = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = audioURL;
    link.download = 'screen.webm';
    link.click();
    URL.revokeObjectURL(link.href);
  };
  const saveMedia = (cameraBlob, screenBlob) => {
    if (cameraBlob) {
      saveCameraMedia(cameraBlob);
    }
    if (screenBlob) {
      saveScreenMedia(screenBlob);
    }
  };
  const startCameraRecord = () => {
    if (cameraRecorderRef.current) {
      cameraRecorderRef.current.start(3000);
    }
  };
  const startScreenRecord = () => {
    if (screenRecorderRef.current) {
      screenRecorderRef.current.start(3000);
    }
  };
  const startRecord = () => {
    setHasStarted(true);
    setIsRecording(true);
    startCameraRecord();
    startScreenRecord();
  };
  const pauseCameraRecord = () => {
    if (cameraRecorderRef.current) {
      cameraRecorderRef.current.pause();
    }
  };
  const pauseScreenRecord = () => {
    if (screenRecorderRef.current) {
      screenRecorderRef.current.pause();
    }
  };
  const pauseRecord = () => {
    setIsRecording(false);
    pauseCameraRecord();
    pauseScreenRecord();
  };
  const resumeCameraRecord = () => {
    if (cameraRecorderRef.current) {
      cameraRecorderRef.current.resume();
    }
  };
  const resumeScreenRecord = () => {
    if (screenRecorderRef.current) {
      screenRecorderRef.current.resume();
    }
  };
  const resumeRecord = () => {
    setIsRecording(true);
    resumeCameraRecord();
    resumeScreenRecord();
  };
  const createCrmeraRecorder = (stream) => {
    const options = {
      audioBitsPerSecond: cameraAudioBitsPerSecond,
      videoBitsPerSecond: cameraVideoBitsPerSecond,
      mimeType: type.webm,
    };
    const recorder = new MediaRecorder(stream, options);
    cameraRecorderRef.current = recorder;
    recorder.ondataavailable = (event) => {
      if (cameraChunksRef.current) {
        cameraChunksRef.current.push(event.data);
      }
    };
    recorder.onstop = () => {
      const blob = new Blob(cameraChunksRef.current, {
        type: type.webm,
      });
      saveCameraMedia(blob);
    };
    recorder.onerror = console.log;
  };
  const createScreenRecorder = (stream) => {
    const options = {
      audioBitsPerSecond: 12800,
      videoBitsPerSecond: screenAudioBitsPerSecond,
      mimeType: type.webm,
    };
    const recorder = new MediaRecorder(stream, options);
    screenRecorderRef.current = recorder;
    recorder.ondataavailable = (event) => {
      if (screenChunksRef.current) {
        screenChunksRef.current.push(event.data);
      }
    };
    recorder.onstop = () => {
      const blob = new Blob(screenChunksRef.current, {
        type: type.webm,
      });
      saveScreenMedia(blob);
    };
    recorder.onerror = console.log;
  };
  useEffect(() => {
    navigator.mediaDevices
      .enumerateDevices()
      .then((devices) => devices.filter((d) => d.kind === 'videoinput')[0])
      .then((video) => navigator.mediaDevices.getUserMedia({ video }))
      .then(async (stream) => {
        if (cameraRef.current) {
          cameraRef.current.srcObject = stream;
          cameraRef.current.onloadedmetadata = (_e) => {
            if (cameraRef.current) {
              cameraRef.current.play();
            }
          };
        }
        const audioTracks = await navigator.mediaDevices
          .getUserMedia({ audio: true, video: false })
          .then((mediaStream) => mediaStream.getAudioTracks()[0]);
        stream.addTrack(audioTracks);
        createCrmeraRecorder(stream);
        return null;
      })
      .catch(console.log);
  }, []);
  const stopRecord = async () => {
    setHasStarted(false);
    setIsRecording(false);
    if (cameraRecorderRef.current) {
      cameraRecorderRef.current.stop();
    }
    if (screenRecorderRef.current) {
      screenRecorderRef.current.stop();
    }
  };
  useEffect(() => {
    navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: true,
      cursor: 'always',
    })
      .then(async (stream) => {
        if (screenRef.current) {
          screenRef.current.srcObject = stream;
          screenRef.current.onloadedmetadata = (_e) => {
            if (screenRef.current) {
              screenRef.current.play();
            }
          };
        }
        createScreenRecorder(stream);
        return null;
      })
      .catch(console.log);
  }, []);
  return (
    <div className={classes.root}>
      <Grid container spacing={3}>
        <Grid item xs={4}>
          <Paper className={classes.paper}>
            <video src="" ref={cameraRef} width="100%" className={classes.camera} autoPlay />
            {/* <div style={{ margin: 16 }}>
              audioBitsPerSecond
              <Input
                defaultValue={cameraAudioBitsPerSecond}
                inputProps={{ type: 'number' }}
                value={cameraAudioBitsPerSecond}
                onChange={(e) => setCameraAudioBitsPerSecond(e.target.value)}
              />
            </div>
            <div style={{ margin: 16 }}>
              videoBitsPerSecond
              <Input
                defaultValue={cameraVideoBitsPerSecond}
                inputProps={{ type: 'number' }}
                value={cameraVideoBitsPerSecond}
                onChange={(e) => setCameraVideoBitsPerSecond(e.target.value)}
              />
            </div> */}
            <div style={{ margin: 16 }}>
              <Button
                onClick={() => setShowCamera(!showCamera)}
                variant="contained"
                color="secondary"
              >
                {showCamera ? '隐藏摄像头' : '展示摄像头'}
              </Button>
            </div>
          </Paper>
        </Grid>
        <Grid item xs={4}>
          <Paper className={classes.paper}>
            <video src="" ref={screenRef} width="100%" className={classes.screen} autoPlay />
            {/* <div style={{ margin: 16 }}>
              videoBitsPerSecond
              <Input
                defaultValue={screenAudioBitsPerSecond}
                inputProps={{ type: 'number' }}
                value={screenAudioBitsPerSecond}
                onChange={(e) => setScreenAudioBitsPerSecond(e.target.value)}
              />
            </div> */}
            <div style={{ margin: 16 }}>
              <Button
                onClick={() => setShowScreen(!showScreen)}
                variant="contained"
                color="secondary"
              >
                {showScreen ? '隐藏屏幕' : '展示屏幕'}
              </Button>
            </div>
          </Paper>

        </Grid>
        <Grid item xs={4}>
          <Paper className={classes.paper}>
            <div style={{ margin: 16, display: 'flex', justifyContent: 'center' }}>
              <div>{isRecording && '录制中'}</div>
              <div style={{ margin: 16 }}>
                <Button
                  onClick={startRecord}
                  variant="contained"
                  color="secondary"
                >
                  开始
                </Button>
              </div>
              <div style={{ margin: 16 }}>
                <Button onClick={stopRecord} variant="contained" color="secondary">
                  结束
                </Button>
              </div>
            </div>
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
}

export default App;

import { useState, useEffect } from "react";
import {
  Card,
  Grid,
  IconButton,
  Button,
  Modal,
  LinearProgress,
} from "@mui/material";
import AddBoxIcon from "@mui/icons-material/AddBox";
import ReactPlayer from "react-player";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { useNavigate } from "react-router-dom";
import { storage, db } from "../util/firebase";
import { doc, setDoc } from "firebase/firestore";

const Home = () => {
  const navigate = useNavigate();
  const [video, setVideo] = useState(undefined);
  const [videoFilePath, setVideoFilePath] = useState(null);
  const [progressState, setProgressState] = useState(0);
  const [loading, setLoading] = useState(false);
  const [cancel, setCancel] = useState(() => {});

  function onVideoChange(e) {
    setVideoFilePath(URL.createObjectURL(e.target?.files?.[0]));
    setVideo(e.target?.files?.[0]);
  }

  const cancelVideoUpload = () => {
    cancel.func();
    setProgressState(0);
    setLoading(false);
  };

  const handleUploadVideo = async () => {
    setLoading(true);

    const storageRef = ref(storage, `/${Date.now()}/${video.name}`);
    const uploadTask = uploadBytesResumable(storageRef, video);
    setCancel({ func: () => uploadTask.cancel() });
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;

        setProgressState(Math.floor(progress));
      },
      (error) => {
        console.log(error);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref)
          .then((URL) => {
            return URL;
          })
          .then(async (data) => {
            await setDoc(doc(db, "all", "videos"), {
              date: Date.now(),
              videoURL: data,
            });
          })
          .finally(() => {
            navigate("/all");
          });
      }
    );
  };

  return (
    <>
      <div className="area">
        <ul className="circles">
          {Array(35)
            .fill("")
            .map((val, index) => (
              <li key={index}></li>
            ))}
        </ul>

        {!loading && (
          <Card
            style={{
              margin: "0 auto",
              width: "50%",
              position: "relative",
              top: "20%",
            }}
          >
            <div style={{ padding: 30 }}>
              <h2 style={{ textAlign: "center" }}>
                Upload your media here to have it show in /all
              </h2>
              <input
                hidden
                id="icon-button-file"
                type="file"
                multiple
                accept="video/mp4,video/x-m4v,video/*"
                onChange={onVideoChange}
              />

              <Grid
                container
                alignItems="center"
                justifyContent="center"
                spacing={5}
                style={{ marginTop: 5 }}
              >
                <Grid item xs={2}>
                  <IconButton component="label" htmlFor="icon-button-file">
                    <AddBoxIcon
                      style={{
                        fontSize: 50,
                        color: "#0C6588",
                      }}
                    />
                  </IconButton>
                </Grid>
                {videoFilePath && (
                  <Grid item xs={10} container justifyContent="center">
                    <div style={{ minHeight: 200 }}>
                      <ReactPlayer
                        width={400}
                        height={200}
                        controls
                        url={videoFilePath}
                      />
                    </div>
                  </Grid>
                )}
                <Grid item xs={12} container justifyContent="center">
                  {video && (
                    <Button
                      variant="contained"
                      onClick={() => handleUploadVideo()}
                    >
                      Upload!
                    </Button>
                  )}
                </Grid>
              </Grid>
            </div>
          </Card>
        )}
      </div>
      <Modal open={loading}>
        <div
          style={{
            width: "50%",
            margin: "0 auto",
            position: "relative",
            top: "40%",
          }}
        >
          <h3
            style={{ color: "white", textAlign: "center", paddingBottom: 20 }}
          >
            Please wait while we upload your file. You will then be redirected
            to the /all page
          </h3>

          <LinearProgress
            variant="buffer"
            value={progressState}
            valueBuffer={progressState * (1 + Math.random())}
          />
          <Button
            variant="outlined"
            color="error"
            style={{ marginTop: 30, position: "relative", left: "45%" }}
            onClick={() => cancelVideoUpload()}
          >
            cancel
          </Button>
        </div>
      </Modal>
    </>
  );
};
export default Home;

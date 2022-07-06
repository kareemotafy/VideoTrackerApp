import { useState, useEffect } from "react";
import {
  Card,
  Grid,
  IconButton,
  Button,
  Modal,
  LinearProgress,
  useMediaQuery,
  useTheme,
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
  const theme = useTheme();

  const isMD = useMediaQuery(theme.breakpoints.down("md"));

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
            await setDoc(
              doc(db, "videos", Date.now() + data.slice(data.length - 10)),
              {
                date: Date.now(),
                videoURL: data,
              }
            );
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
        <Button
          style={{
            marginBottom: 10,
            position: "relative",
            top: isMD ? "5%" : "10%",
            left: isMD ? "5%" : "25%",
            backgroundColor: "white",
          }}
          variant="outlined"
          onClick={() => navigate("/all")}
        >
          go to /all
        </Button>
        {!loading && (
          <Card
            style={{
              margin: "0 auto",
              width: isMD ? "90%" : "50%",
              position: "relative",
              top: isMD ? "5%" : "10%",
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

              <Grid container style={{ marginTop: 5 }}>
                {videoFilePath && (
                  <Grid
                    item
                    xl={10}
                    lg={10}
                    md={12}
                    sm={12}
                    xs={12}
                    container
                    justifyContent="center"
                  >
                    <ReactPlayer controls url={videoFilePath} />
                  </Grid>
                )}
                <Grid
                  item
                  xl={!!videoFilePath ? 2 : 12}
                  lg={!!videoFilePath ? 2 : 12}
                  md={12}
                  sm={12}
                  xs={12}
                  container
                  justifyContent="center"
                >
                  <IconButton component="label" htmlFor="icon-button-file">
                    <AddBoxIcon
                      style={{
                        fontSize: 50,
                        color: "#0C6588",
                      }}
                    />
                  </IconButton>
                </Grid>

                <Grid item xs={12} container justifyContent="center">
                  {video && (
                    <Button
                      style={{ marginTop: 10 }}
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

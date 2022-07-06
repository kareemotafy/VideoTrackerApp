import { useState, useEffect } from "react";
import { Card, Grid } from "@mui/material";
import ReactPlayer from "react-player";
import { db } from "../util/firebase";
import { getDocs, collection } from "firebase/firestore";

const All = () => {
  const [videos, setVideos] = useState([]);

  const getVideo = async () => {
    const querySnapshot = await getDocs(collection(db, "videos"));
    const data = [];
    querySnapshot.forEach((doc) => {
      data.push({ id: doc.id, ...doc.data() });
    });
    console.log(data);
    setVideos(data);
  };

  useEffect(() => {
    getVideo();
  }, []);

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
        <Grid container style={{ paddingTop: 20 }}>
          {videos.map(({ id, date, videoURL }, index) => (
            <Grid
              key={index}
              item
              xl={6}
              lg={6}
              md={6}
              sm={12}
              xs={12}
              container
              justifyContent="center"
              alignItems="center"
            >
              <Card style={{ width: 500 }}>
                <ReactPlayer
                  width={400}
                  height={200}
                  controls
                  url={videoURL}
                  style={{ padding: 50 }}
                />
                <h3 style={{ textAlign: "center", paddingBottom: 20 }}>
                  Submitted at: {new Date(date).toLocaleString()}
                </h3>
              </Card>
            </Grid>
          ))}
        </Grid>
      </div>
    </>
  );
};
export default All;

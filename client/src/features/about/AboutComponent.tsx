import { Box, Card, Typography } from "@mui/material";
import { useContext } from "react";
import { AppContext } from "../../App";
import { useAppSelector } from "../../app/hooks";
import { SpaceType } from "../space/space";
import { selectFocusTab, selectFrameTab } from "../tab/tabSlice";


export default function AboutComponent() {
  const {
    user,
  } = useContext(AppContext);
  
  const frameTab = useAppSelector(selectFrameTab);
  const focusTab = useAppSelector(selectFocusTab);

  return (
    <Card elevation={5} sx={{
      position: 'absolute',
      display: !frameTab && !focusTab
        ? 'flex'
        : 'none',
      padding: 2,
      left: 'calc(50% - 210px)',
      top: 'calc(50% - 210px)',
      width: '420px',
      flexDirection: 'column',
    }}>
      <Box>
        <Typography variant='overline'>
          About
        </Typography>
      </Box>
      <Box>
        <p>
          Browse the Web as a weighted directed graph.
        </p>
        <p>
          Each graph is a node that has been opened for the viewing of its contents.
        </p>
        <p>
          This app gives you two slots, A and B, to use in viewing graphs.
        </p>
        <p>
          click a tab to load it into slot A; double click a tab to load it into slot B
        </p>
        <p>
          Each graph has a directory tree, indicated by the solid lines between nodes.
        </p>
        <p>
          Collect and share your favorite graphs. Organize them by creating edges between them.
        </p>
      </Box>
    </Card>
  )
}
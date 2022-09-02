import { Box, Card, Typography } from "@mui/material";
import { useContext } from "react";
import { AppContext } from "../../App";
import { useAppSelector } from "../../app/hooks";
import { SpaceType } from "../space/space";
import { selectIsOpen } from "../space/spaceSlice";


export default function AboutComponent() {
  const {
    user,
  } = useContext(AppContext);

  const frameIsOpen = useAppSelector(selectIsOpen(SpaceType.FRAME));
  const focusIsOpen = useAppSelector(selectIsOpen(SpaceType.FOCUS));

  return (
    <Card elevation={5} sx={{
      position: 'absolute',
      display: (!frameIsOpen || !user?.frame) && (!focusIsOpen || !user?.focus)
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
        Browse the Web one graph at a time!
        </p>
        <p>
        A graph is a node that has been opened for the viewing of its contents.
        </p>
        <p>
          This app gives you two slots, 1 and 2, to use in viewing graphs.
        </p>
        <p>
          Each graph has a directory tree, indicated by the solid lines between nodes.
        </p>
        <p>
          Use the consensus algorithm of your choice to share graphs and decide what graphs represent you.
        </p>
      </Box>
    </Card>
  )
}
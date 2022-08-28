import { Box, Button, Card, Dialog, IconButton, InputAdornment, InputLabel, OutlinedInput, TextField, Typography } from "@mui/material";
import { Dispatch, SetStateAction, useContext, useEffect, useState } from "react";
import LooksOneIcon from '@mui/icons-material/LooksOne';
import LooksTwoIcon from '@mui/icons-material/LooksTwo';
import { AppContext } from "../../App";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { selectSelectedSpace } from "../space/spaceSlice";
import { SpaceType } from "../space/space";
import { gql, useMutation } from "@apollo/client";
import { ABSTRACT_ARROW_FIELDS } from "./arrowFragments";
import { mergeUsers } from "../user/userSlice";
import { mergeArrows } from "./arrowSlice";


const CREATE_FRAME_GRAPH = gql`
  mutation CreateFrameGraph($title: String!, $routeName: String!, $arrowId: String) {
    createFrameGraph(title: $title, routeName: $routeName, arrowId: $arrowId) {
      id
      frameId
      frame {
        ...AbstractArrowFields
      }
    }
  }
  ${ABSTRACT_ARROW_FIELDS}
`;

const CREATE_FOCUS_GRAPH = gql`
  mutation CreateFocusGraph($title: String!, $routeName: String!, $arrowId: String) {
    createFocusGraph(title: $title, routeName: $routeName, arrowId: $arrowId) {
      id
      focusId
      focus {
        ...AbstractArrowFields
      }
    }
  }
  ${ABSTRACT_ARROW_FIELDS}
`;

interface CreateGraphDialogProps {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  space: SpaceType | null;
  arrowId: string | null;
}
export default function CreateGraphDialog(props: CreateGraphDialogProps) {
  const dispatch = useAppDispatch();

  const { 
    user,
    dimColor: color,
  } = useContext(AppContext);

  const selectedSpace = useAppSelector(selectSelectedSpace);

  const [name, setName] = useState('');
  const [routeName, setRouteName] = useState('');
  const [location, setLocation] = useState(null as SpaceType | null);

  const [createFrameGraph] = useMutation(CREATE_FRAME_GRAPH, {
    onError: err => {
      console.error(err);
    },
    onCompleted: data => {
      console.log(data);
      dispatch(mergeUsers([data.createFrameGraph]));
      dispatch(mergeArrows([data.createFrameGraph.frame]))
    }
  });

  const [createFocusGraph] = useMutation(CREATE_FOCUS_GRAPH, {
    onError: err => {
      console.error(err);
    },
    onCompleted: data => {
      console.log(data);
      dispatch(mergeUsers([data.createFocusGraph]));
      dispatch(mergeArrows([data.createFocusGraph.focus]))
    },
  });

  useEffect(() => {
    console.log(props.space);
    setLocation(
      props.space || (user?.frame
        ? user?.focus
          ? selectedSpace === SpaceType.FRAME
            ? SpaceType.FOCUS
            : SpaceType.FRAME
          : SpaceType.FOCUS
        : SpaceType.FRAME)
    )
  }, [user?.frame, user?.focus, selectedSpace, props.space]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  }

  const handleRouteNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRouteName(e.target.value);
  }

  const handleFrameClick = () => {
    setLocation(SpaceType.FRAME);
  }

  const handleFocusClick = () => {
    setLocation(SpaceType.FOCUS);
  }

  const handleClose = () => {
    props.setIsOpen(false);
  }

  const handleSubmitClick = () => {
    if (location === SpaceType.FRAME) {
      createFrameGraph({ 
        variables: {
          title: name, 
          routeName,
          arrowId: props.arrowId,
        },
      });
    } else {
      createFocusGraph({ 
        variables: { 
          title: name, 
          routeName,
          arrowId: props.arrowId,
        },
      });
    }
    props.setIsOpen(false);
  }

  return (
    <Dialog open={props.isOpen} onClose={handleClose}>
      <Card elevation={5} sx={{
        padding: 2,
        width: '350px',
      }}>
        <Typography variant='overline'>
          Create a graph
        </Typography>
        <Box sx={{
          marginTop:2,
        }}>
          <TextField
            variant='outlined' 
            label='Name*'
            value={name}
            onChange={handleNameChange}
            sx={{
              width: '100%',
            }}
          />
        </Box>
        <Box sx={{
          marginTop:2,
        }}>
          <TextField
            variant='outlined' 
            label='Permalink*'
            value={routeName}
            onChange={handleRouteNameChange}
            sx={{
              width: '100%',
            }}
            InputProps={{
              startAdornment: <InputAdornment position="start" sx={{mr: 0}}>g/</InputAdornment>,
            }}
          />
        </Box>
        <Box sx={{
          marginTop:2,
          color,
        }}>
          Location:&nbsp;&nbsp;
          <IconButton onClick={handleFrameClick} sx={{
            color: location === SpaceType.FRAME
              ? user?.color
              : null,
            border: location === SpaceType.FRAME
              ? `1px solid ${user?.color}`
              : 'none',
          }}>
            <LooksOneIcon />
          </IconButton>
          &nbsp;
          <IconButton onClick={handleFocusClick} sx={{
            color: location === SpaceType.FOCUS
              ? user?.color
              : null,
            border: location === SpaceType.FOCUS
              ? `1px solid ${user?.color}`
              : 'none',
          }}>
            <LooksTwoIcon />
          </IconButton>
        </Box>
        <Box sx={{
          marginTop: 2,
        }}>
          <Button variant='contained' onClick={handleSubmitClick}>
            Create
          </Button>
          &nbsp;&nbsp;
          <Button onClick={handleClose}>
            Cancel
          </Button>
        </Box>
      </Card>
    </Dialog>
  )
}
import { Box, Button, Card, Dialog, TextField, Typography } from "@mui/material";
import { Dispatch, SetStateAction, useContext, useEffect, useState } from "react";
import { AppContext } from "../../App";
import { useAppDispatch } from "../../app/hooks";
import { SpaceType } from "../space/space";
import { gql, useMutation } from "@apollo/client";
import { FULL_TAB_FIELDS } from "../tab/tabFragments";
import { mergeTabs } from "../tab/tabSlice";
import { useNavigate } from "react-router-dom";

const CREATE_GRAPH = gql`
  mutation CreateGraphTab($name: String!, $routeName: String!) {
    createGraphTab(name: $name, routeName: $routeName) {
      ...FullTabFields
    } 
  }
  ${FULL_TAB_FIELDS}
`;

interface CreateGraphDialogProps {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  space: SpaceType | null;
  arrowId: string | null;
}
export default function CreateGraphDialog(props: CreateGraphDialogProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { 
    user,
    dimColor: color,
  } = useContext(AppContext);

  const [name, setName] = useState('');
  const [routeName, setRouteName] = useState('');
  const [routeError, setRouteError] = useState('');

  const [create] = useMutation(CREATE_GRAPH, {
    onError: err => {
      console.error(err);
    },
    onCompleted: data => {
      console.log(data, routeName);
      dispatch(mergeTabs(data.createGraphTab));
      navigate(`/g/${routeName}/0`);
    }
  });

  useEffect(() => {
    const route = routeName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    if (route !== routeName) {
      setRouteName(route)
    }
  }, [routeName]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  }

  const handleRouteNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRouteName(e.target.value);
  }

  const handleClose = () => {
    props.setIsOpen(false);
  }

  const handleSubmitClick = () => {
    create({
      variables: {
        name,
        routeName,
      },
    });
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
            error={!!routeError}
            label='route-name*'
            value={routeName}
            onChange={handleRouteNameChange}
            helperText={routeError}
            sx={{
              width: '100%',
            }}
          />
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
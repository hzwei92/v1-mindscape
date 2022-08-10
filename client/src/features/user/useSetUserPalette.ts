import { useAppDispatch } from "../../app/hooks";
import { gql, useMutation, useReactiveVar } from '@apollo/client';
import { useSnackbar } from "notistack";
import { PaletteMode } from "@mui/material";
import { mergeUsers, setCurrentUser } from "./userSlice";
import { useContext } from "react";
import { AppContext } from "../../App";
import { sessionVar } from "../../cache";

const SET_PALETTE = gql`
  mutation SetUserPalette($sessionId: String!, $palette: String!) {
    setUserPalette(sessionId: $sessionId, palette: $palette) {
      id
      palette
    }
  }
`;

export default function useSetUserPalette() {
  const dispatch = useAppDispatch();

  const { setPalette } = useContext(AppContext);

  const sessionDetail = useReactiveVar(sessionVar);
  
  const { enqueueSnackbar } = useSnackbar();

  const [setPaletteMode] = useMutation(SET_PALETTE, {
    onError: error => {
      console.error(error);

      enqueueSnackbar(error.message);
    },
    onCompleted: data => {
      console.log(data);

      dispatch(mergeUsers([data.setUserPalette]));
    },
  });
  
  const setUserPalette = (palette: PaletteMode) => {
    setPalette(palette === 'light'
      ? 'light'
      : 'dark');

    setPaletteMode({
      variables: {
        sessionId: sessionDetail.id,
        palette,
      },
    });
  };

  return {
    setUserPalette,
  };
}
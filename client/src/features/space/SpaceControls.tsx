import { Box, Button, Card, Fab } from '@mui/material';
import { MAX_Z_INDEX, MOBILE_WIDTH } from '../../constants';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import SettingsIcon from '@mui/icons-material/Settings';
import PeopleIcon from '@mui/icons-material/People';
import SyncIcon from '@mui/icons-material/Sync';
import { scaleDown, scaleUp } from '../../utils';
import { Dispatch, SetStateAction, useContext } from 'react';
import { SpaceContext } from './SpaceComponent';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { AppContext } from '../../App';
import { selectScale, selectSelectedTwigId, setScale } from './spaceSlice';
import { useReactiveVar } from '@apollo/client';
import { SpaceType } from './space';
import { focusSpaceElVar, frameSpaceElVar } from '../../cache';
import Close from '@mui/icons-material/Close';
import { selectIdToTwig } from '../twig/twigSlice';
import { useNavigate } from 'react-router-dom';
import useInitSpace from './useInitSpace';
import useReplyTwigSub from '../twig/useReplyTwigSub';
import Remove from '@mui/icons-material/Remove';
import useRemoveTab from '../tab/useRemoveTab';
import { selectFocusTab, selectFrameTab, selectIdToTab } from '../tab/tabSlice';
import useUpdateTab from '../tab/useUpdateTab';

interface SpaceControlsProps {
  showSettings: boolean;
  setShowSettings: Dispatch<SetStateAction<boolean>>;
  showRoles: boolean;
  setShowRoles: Dispatch<SetStateAction<boolean>>;
}
export default function SpaceControls(props: SpaceControlsProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { user, width, palette } = useContext(AppContext);
  const { space } = useContext(SpaceContext);

  const frameTab = useAppSelector(selectFrameTab);
  const focusTab = useAppSelector(selectFocusTab);

  const idToTab = useAppSelector(selectIdToTab)
  const frameSelectedTwigId = useAppSelector(selectSelectedTwigId(SpaceType.FRAME));
  const frameIdToTwig = useAppSelector(selectIdToTwig(SpaceType.FRAME));
  const focusSelectedTwigId = useAppSelector(selectSelectedTwigId(SpaceType.FOCUS));
  const focusIdToTwig = useAppSelector(selectIdToTwig(SpaceType.FOCUS));

  const spaceEl = useReactiveVar(space === SpaceType.FRAME
    ? frameSpaceElVar
    : focusSpaceElVar);
    
  const scale = useAppSelector(selectScale(space));

  const isSynced = true;

  const { updateTab } = useUpdateTab();
  const { removeTab } = useRemoveTab();

  useInitSpace();
  useReplyTwigSub();

  const handleScaleDownClick = (event: React.MouseEvent) => {
    event.stopPropagation();

    if (!spaceEl?.current) return;

    const center = {
      x: (spaceEl.current.scrollLeft + (spaceEl.current.clientWidth / 2)) / scale,
      y: (spaceEl.current.scrollTop + (spaceEl.current.clientHeight / 2)) / scale,
    }
    const scale1 = scaleDown(scale);

    dispatch(setScale({
      space,
      scale: scale1,
    }));

    const left = (center.x * scale1) - (spaceEl.current.clientWidth / 2);
    const top = (center.y * scale1) - (spaceEl.current.clientHeight / 2);

    spaceEl.current.scrollTo({
      left,
      top,
    })
  };

  const handleScaleUpClick = (event: React.MouseEvent) => {
    event.stopPropagation();

    if (!spaceEl?.current) return;

    const center = {
      x: (spaceEl.current.scrollLeft + (spaceEl.current.clientWidth / 2)) / scale,
      y: (spaceEl.current.scrollTop + (spaceEl.current.clientHeight / 2)) / scale,
    };
    const scale1 = scaleUp(scale);

    dispatch(setScale({
      space,
      scale: scale1
    }));

    const left = (center.x * scale1) - (spaceEl.current.clientWidth / 2);
    const top = (center.y * scale1) - (spaceEl.current.clientHeight / 2);
    setTimeout(() => {
      spaceEl.current?.scrollTo({
        left,
        top,
      });
    }, 5)
  };

  const handleHideClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (space === SpaceType.FRAME) {
      updateTab(frameTab, false, false);

      if (focusTab) {
        const focusTwig = focusIdToTwig[focusSelectedTwigId];
        const route = `/g/${focusTab.arrow.routeName}/${focusTwig.i || 0}`;
        navigate(route);
      }
      else {
        navigate(`/`);
      }
    }
    else if (space == SpaceType.FOCUS) {
      updateTab(focusTab, false, false);

      if (frameTab) {
        const frameTwig = frameIdToTwig[frameSelectedTwigId];
        const route = `/g/${frameTab.arrow.routeName}/${frameTwig.i}`;
        navigate(route);
      }
      else {
        navigate(`/`);
      }
    }
  }

  const handleCloseClick = (event: React.MouseEvent) => {
    if (space === SpaceType.FRAME) {
      removeTab(frameTab?.id);
      
      if (focusTab) {
        const focusTwig = focusIdToTwig[focusSelectedTwigId];
        const route = `/g/${focusTab.arrow.routeName}/${focusTwig.i || 0}`;
        navigate(route);
      }
      else {
        navigate(`/`);
      }
    }
    else if (space == SpaceType.FOCUS) {
      removeTab(focusTab?.id);

      if (frameTab) {
        const frameTwig = frameIdToTwig[frameSelectedTwigId];
        const route = `/g/${frameTab.arrow.routeName}/${frameTwig.i}`;
        navigate(route);
      }
      else {
        navigate(`/`);
      }
    }
  };

  const handleSettingsClick = () => {
    props.setShowSettings(show => !show)
  };

  const handleRolesClick = () => {
    props.setShowRoles(show => !show)
  }

  const handleSyncClick = () => {
    // dispatch(setFocusIsSynced(true));
    // dispatch(setFocusShouldSync(true));
  };

  return (
    <Box sx={{
      position: 'absolute',
      right: 190,
      top: 5,
    }}>
      <Box sx={{
        position: 'fixed',
        flexDirection: 'row',
        zIndex: MAX_Z_INDEX,
        display: 'flex',
      }}>
        <Box sx={{
          verticalAlign:'top',
        }}>
          <Card variant='outlined' sx={{
            margin: 'auto',
            padding: 1,
            whiteSpace: 'nowrap',
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between'
          }}>
            <Button disabled={width < MOBILE_WIDTH ? scale === .25 : scale === .03125} variant='contained' onClick={handleScaleDownClick} sx={{
              minWidth: 0,
              minHeight: 0,
              width: '20px',
              height: '20px',
            }}>
              <RemoveIcon />
            </Button>
            <Box component='span' sx={{
              width: '50px',
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'center',
            }}>
              { Math.round(scale * 100) }%
            </Box>
            <Button disabled={scale === 4} variant='contained' onClick={handleScaleUpClick} sx={{
              minWidth: 0,
              minHeight: 0,
              width: '20px',
              height: '20px'
            }}>
              <AddIcon />
            </Button>
          </Card>
        </Box>
        &nbsp;&nbsp;
        <Box sx={{
          display: 'flex',
          flexDirection: 'column'
        }}>
           <Fab title='Hide' size='small' onClick={handleHideClick} sx={{
            fontSize: 20,
            backgroundColor: palette === 'dark'
              ? '#000000'
              : '#ffffff',
            color: 'primary.main',
          }}>
            <Remove fontSize='inherit'/>
          </Fab> 
          <Fab title='Close' size='small' onClick={handleCloseClick} sx={{
            fontSize: 20,
            marginTop: 1,
            backgroundColor: palette === 'dark'
              ? '#000000'
              : '#ffffff',
            color: 'primary.main',
          }}>
            <Close fontSize='inherit'/>
          </Fab> 
          <Fab title='Settings' size='small' onClick={handleSettingsClick} sx={{
            fontSize: 20,
            marginTop: 1,
            backgroundColor: palette === 'dark'
              ? '#000000'
              : '#ffffff',
            color: 'primary.main',
          }}>
            <SettingsIcon fontSize='inherit'/>
          </Fab> 
          <Fab title='Members' size='small' onClick={handleRolesClick} sx={{
            fontSize: 20,
            marginTop: 1,
            backgroundColor: props.showRoles
              ? 'primary.main'
              : palette === 'dark'
                ? '#000000'
                : '#ffffff',
            color: props.showRoles
              ? null
              :'primary.main',
          }}>
            <PeopleIcon fontSize='inherit'/>
          </Fab> 
          <Box sx={{
            display: isSynced || space === 'FRAME'
              ? 'none'
              : 'block'
          }}>
            <Fab title='Sync' size='small' color='primary' onClick={handleSyncClick} sx={{
              marginTop: 1,
              fontSize: 20,
            }}>
              <SyncIcon fontSize='inherit'/>
            </Fab>  
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
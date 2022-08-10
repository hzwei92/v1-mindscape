import { Box, Button, Card, Fab } from '@mui/material';
import { MAX_Z_INDEX, MOBILE_WIDTH, NOT_FOUND } from '../../constants';
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
import { selectIsOpen, selectScale, setScale } from './spaceSlice';
import { useReactiveVar } from '@apollo/client';
import { SpaceType } from './space';
import { focusSpaceElVar, frameSpaceElVar } from '../../cache';

interface SpaceControlsProps {
  setShowSettings: Dispatch<SetStateAction<boolean>>;
  setShowRoles: Dispatch<SetStateAction<boolean>>;
}
export default function SpaceControls(props: SpaceControlsProps) {
  const dispatch = useAppDispatch();

  const { width } = useContext(AppContext);
  const { space } = useContext(SpaceContext);

  const isOpen = useAppSelector(selectIsOpen(space));

  const spaceEl = useReactiveVar(space === SpaceType.FRAME
    ? frameSpaceElVar
    : focusSpaceElVar);
    
  const scale = useAppSelector(selectScale(space));

  const isSynced = true;

  if (!isOpen) return null;


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
          <Fab title='Settings' size='small' color='primary' onClick={handleSettingsClick} sx={{
            fontSize: 20,
          }}>
            <SettingsIcon fontSize='inherit'/>
          </Fab> 
          <Fab title='Members' size='small' color='primary' onClick={handleRolesClick} sx={{
            fontSize: 20,
            marginTop: 1,
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
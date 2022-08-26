import { Box, Link, Typography } from '@mui/material';
import { addInstance, removeInstance, selectArrowById, selectInstanceById } from './arrowSlice';
import { useContext, useEffect } from 'react';
import ArrowEditor from './ArrowEditor';
import { AppContext } from '../../App';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { getTimeString } from '../../utils';
import UserTag from '../user/UserTag';
import ArrowVoter from './ArrowVoter';
import AdjustIcon from '@mui/icons-material/Adjust';
import SouthEastIcon from '@mui/icons-material/SouthEast';
import NorthWestIcon from '@mui/icons-material/NorthWest';
import { selectUserById } from '../user/userSlice';

interface ArrowProps {
  arrowId: string;
  showLinkLeftIcon: boolean;
  showLinkRightIcon: boolean;
  showPostIcon: boolean;
  instanceId: string;
  isWindow: boolean;
  isGroup: boolean;
  isTab: boolean;
}

export default function ArrowComponent(props: ArrowProps) {
  const dispatch = useAppDispatch();
  const { dimColor } = useContext(AppContext);

  const arrow = useAppSelector(state => selectArrowById(state, props.arrowId));
  const arrowUser = useAppSelector(state => selectUserById(state, arrow?.userId));

  useAppSelector(state => selectInstanceById(state, props.instanceId)); // rerender on instance change

  useEffect(() => {
    dispatch(addInstance({
      id: props.instanceId,
      arrowId: props.arrowId,
      isNewlySaved: false,
      shouldRefreshDraft: false,
    }));
    return () => {
      dispatch(removeInstance(props.instanceId));
    };
  }, []);

  if (!arrow) return null;

  const time = new Date(arrow.removeDate || arrow.commitDate || arrow.saveDate || Date.now()).getTime();
  const timeString = getTimeString(time);

  return (
    <Box sx={{
      margin:1,
      position: 'relative',
    }}>
      <Box sx={{
        position: 'absolute',
        left: -35,
        top: -10,
      }}>
        <ArrowVoter arrow={arrow} />
      </Box>
      <Box sx={{
        fontSize: 14,
        color: dimColor,
        paddingBottom: '4px',
        display: 'flex',
        flexDirection: 'row',
      }}>
        <Box component='span' sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}>
            {
              props.showLinkRightIcon
                ? <SouthEastIcon fontSize='inherit' sx={{
                    paddingRight: 1,
                  }}/>
                : props.showLinkLeftIcon
                  ? <NorthWestIcon fontSize='inherit' sx={{
                      paddingRight: 1,
                    }}/>
                  : props.showPostIcon
                    ? <AdjustIcon fontSize='inherit' sx={{
                        paddingRight: 1,
                      }}/>
                    : null
            }
        </Box>
        <UserTag user={arrowUser} />
        &nbsp;
        { ' ' }
        { timeString }
        {
          arrow.removeDate
            ? ' (deleted)'
            : arrow.commitDate 
              ? ' (committed)'
              : null
        }
        {
          // arrow.ownerArrow.id === props.abstract?.id
          //   ? null
          //   : <Box sx={{
          //       marginTop: 1,
          //     }}>
          //       &nbsp;&nbsp;
          //       <Link color={arrow.ownerArrow.color} onMouseDown={handleMouseDown} onClick={handleJamClick}
          //         sx={{
          //           color: arrow.ownerArrow.color,
          //           cursor: 'pointer'
          //         }}
          //       >
          //         {`m/${arrow.ownerArrow.routeName}`}
          //       </Link>
          //     </Box>
        }
      </Box>
      <Box>
        {
          arrow.title 
            ? <Box sx={{
                paddingTop: '5px',
              }}>
                <Typography fontWeight='500' fontSize={20} sx={{
                  whiteSpace: 'pre-wrap',
                  wordWrap: 'break-word',
                }}>
                  {
                    arrow.faviconUrl
                      ? <Box component='img' src={arrow.faviconUrl} sx={{
                          display: 'inline-block',
                          width: 20,
                          height: 20,
                          marginRight: 1,
                        }}/> 
                      : null
                  }
                  {arrow.title}
                </Typography>
              </Box>
            : null
        }
        <ArrowEditor
          arrow={arrow}
          isReadonly={false}
          instanceId={props.instanceId}
        />
      </Box>
    </Box>
  )

}
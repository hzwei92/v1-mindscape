import { Box, Icon, Link, Typography } from '@mui/material';
import type React from 'react';
import { selectArrow } from './arrowSlice';
import { useContext } from 'react';
import ArrowEditor from './ArrowEditor';
import { AppContext } from '../../App';
import { useAppSelector } from '../../app/hooks';
import { getTimeString } from '../../utils';
import { TWIG_WIDTH } from '../../constants';
import UserTag from '../user/UserTag';
import ArrowVoter from './ArrowVoter';

interface ArrowProps {
  arrowId: string;
  instanceId: string;
  isWindow: boolean;
  isGroup: boolean;
  isTab: boolean;
}

export default function ArrowComponent(props: ArrowProps) {
  const { dimColor } = useContext(AppContext);

  const arrow = useAppSelector(state => selectArrow(state, props.arrowId));

  //useAppSelector(state => selectInstanceById(state, props.instanceId)); // rerender on instance change

  // useEffect(() => {
  //   dispatch(addInstance({
  //     id: props.instanceId,
  //     arrowId: arrow.id,
  //     isNewlySaved: false,
  //     shouldRefreshDraft: false,
  //   }));
  //   return () => {
  //     dispatch(removeInstance(props.instanceId));
  //   };
  // }, []);

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
      }}>
        <UserTag user={arrow.user} />
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
      <Box sx={{
        width: TWIG_WIDTH - 60,
      }}>
        {
          !arrow.url && !arrow.title
            ? <ArrowEditor
                arrow={arrow}
                isReadonly={false}
                instanceId={props.instanceId}
              />
            : <Box sx={{
                paddingTop: '5px',
              }}>
                <Typography fontWeight='bold' fontSize={20} sx={{
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
                {
                  arrow.url
                    ? <Box>
                        <Link component='button' sx={{
                          cursor: 'pointer',
                          whiteSpace: 'pre-wrap',
                          width: '100%',
                          wordWrap: 'break-word',
                          textAlign: 'left',
                        }}>
                          {arrow.url}
                        </Link>
                      </Box>
                    : null
                }
              </Box>
        }

      </Box>
    </Box>
  )

}
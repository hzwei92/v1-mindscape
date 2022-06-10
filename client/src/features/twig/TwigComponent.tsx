import { gql, useApolloClient } from '@apollo/client';
import { Box, Card } from '@mui/material';
import React, { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { TWIG_WIDTH } from '../../constants';
import { Role } from '../role/role';
import { SpaceType } from '../space/space';
import { selectTwigId } from '../space/spaceSlice';
import { User } from '../user/user';
import { selectMode } from '../window/windowSlice';
import { Twig } from './twig';
import TwigBar from './TwigBar';
import TwigControls from './TwigControls';
import { selectDetailIdToTwigId, setTwigHeight } from './twigSlice';
//import useSelectTwig from './useSelectTwig';
import { selectCreateLink, setCreateLink } from '../arrow/arrowSlice';
import { Arrow } from '../arrow/arrow';
import ArrowComponent from '../arrow/ArrowComponent';
import { TWIG_WITH_COORDS } from './twigFragments';

interface TwigComponentProps {
  user: User | null;
  space: SpaceType;
  role: Role | null;
  abstract: Arrow;
  twig: Twig;
  canEdit: boolean;
  canPost: boolean;
  canView: boolean;
  x: number;
  y: number;
  setTouches: Dispatch<SetStateAction<React.TouchList | null>>;
}
function TwigComponent(props: TwigComponentProps) {
  console.log('twig', props.twig.id, props.twig.isPinned);

  const client = useApolloClient();
  const dispatch = useAppDispatch();

  const isPost = props.twig.detail.sourceId === props.twig.detail.targetId;

  //useAppSelector(state => selectInstanceById(state, props.twigId)); // rerender on instance change

  const mode = useAppSelector(selectMode);
  const createLink = useAppSelector(selectCreateLink);
  
  const selectedTwigId = useAppSelector(selectTwigId(props.space));
  const isSelected = selectedTwigId === props.twig.id;

  const [isLoading, setIsLoading] = useState(false);
  const cardEl = useRef<HTMLDivElement | undefined>();

  //const { selectTwig } = useSelectTwig(props.space, props.canEdit);
  //const { linkArrows } = useLinkArrows(props.space);

  useEffect(() => {
    if (!cardEl.current?.clientHeight) return;
    dispatch(setTwigHeight({
      space: props.space,
      twigId: props.twig.id,
      height: cardEl.current.clientHeight,
    }));
  }, [cardEl.current?.clientHeight]);

  useEffect(() => {
    if (props.x !== props.twig.x || props.y !== props.twig.y) {
      client.cache.modify({
        id: client.cache.identify(props.twig),
        fields: {
          x: () => props.x,
          y: () => props.y,
        }
      });
    }
  }, [props.x, props.y])

  const handleClick = (event: React.MouseEvent) => {
    event.stopPropagation();

    if (createLink.sourceId === props.twig.detailId) {
      dispatch(setCreateLink({
        sourceId: '',
        targetId: '',
      }));
    }
    if (createLink.sourceId && createLink.targetId === props.twig.detailId) {
      //linkArrows();
    }
  }

  const handleMouseMove = (event: React.MouseEvent) => {

  }
  const handleMouseDown = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (!isSelected) {
      //selectTwig(props.abstract, props.twig.id, true);
    }
  }

  const handleMouseEnter = (event: React.MouseEvent) => {
    if (createLink.sourceId && createLink.sourceId !== props.twig.detailId) {
      dispatch(setCreateLink({
        sourceId: createLink.sourceId,
        targetId: props.twig.detailId,
      }))
    }
  }

  const handleMouseLeave = (event: React.MouseEvent) => {
    if (createLink.sourceId && createLink.sourceId !== props.twig.detailId) {
      dispatch(setCreateLink({
        sourceId: createLink.sourceId,
        targetId: '',
      }));
    }
  }

  const isLinking = (
    createLink.sourceId === props.twig.detailId || 
    createLink.targetId === props.twig.detailId
  );

  return (
    <Box ref={cardEl}>
      <Card 
        elevation={isSelected? 15 : 5}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          width: isPost
            ? TWIG_WIDTH
            : TWIG_WIDTH - 50,
          opacity: isPost 
            ? 0.9
            : 0.8,
          border: isSelected
            ? `4px solid ${props.twig.user.color}`
            : null,
          borderRadius: isPost
            ? 2
            : 5,
          borderTopLeftRadius: 0,
          backgroundColor: isLinking
            ? mode === 'dark'
              ? 'dimgrey'
              : 'darkgrey'
            : null,
          cursor: createLink.sourceId
            ? 'crosshair'
            : 'default', 
        }}
      >
        {
          isPost
            ? <TwigBar
                space={props.space} 
                abstract={props.abstract} 
                twig={props.twig}
                canEdit={props.canEdit}
                setTouches={props.setTouches}
                isSelected={isSelected}
                isPost={isPost}
              />
            : null
        }
        <Box sx={{
          padding: 0.5,
        }}>
          <Box sx={{
            marginLeft: 0.5,
            marginRight: 0.5,
          }}>
            <ArrowComponent
              user={props.user}
              abstract={props.abstract}
              space={props.space}
              arrow={props.twig.detail}
              instanceId={props.twig.id}
            />  
          </Box>
          <TwigControls
            user={props.user}
            space={props.space}
            twig={props.twig}
            abstract={props.abstract}
            role={props.role}
            canPost={props.canPost}
            canView={props.canView}
            isPost={isPost}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />
        </Box>
      </Card>
    </Box>
  );
}

export default React.memo(TwigComponent)
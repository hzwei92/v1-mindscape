import { useApolloClient } from '@apollo/client';
import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { VIEW_RADIUS } from '../../constants';
import { getPolylineCoords } from '../../utils';
import { SpaceType } from '../space/space';
import { Twig } from '../twig/twig';
import { FULL_TWIG_FIELDS } from '../twig/twigFragments';
import { selectDetailIdToTwigId } from '../twig/twigSlice';
import { User } from '../user/user';
import { Arrow } from './arrow';
import { selectSelectArrowId, setSelectArrowId } from './arrowSlice';

interface SheafProps {
  user: User;
  space: SpaceType;
  links: Arrow[];
}
export default function Sheaf(props: SheafProps) {
  const client = useApolloClient();
  const dispatch = useAppDispatch();

  const detailIdToTwigId = useAppSelector(selectDetailIdToTwigId(props.space));

  const links = props.links.filter(link => !link.deleteDate);

  const selectArrowId = useAppSelector(selectSelectArrowId(props.space));
  const isSelected = links.some(link => link.id === selectArrowId);
  
  const twigs = links.map(link => {
    const twigId = detailIdToTwigId[link.id];
    return client.cache.readFragment({
      id: client.cache.identify({
        id: twigId,
        __typename: 'Twig',
      }),
      fragment: FULL_TWIG_FIELDS,
      fragmentName: 'FullTwigFields'
    }) as Twig;
  });

  const sourceTwig = client.cache.readFragment({
    id: client.cache.identify({
      id: detailIdToTwigId[links[0].sourceId],
      __typename: 'Twig',
    }),
    fragment: FULL_TWIG_FIELDS,
    fragmentName: 'FullTwigFields'
  }) as Twig;

  const targetTwig = client.cache.readFragment({
    id: client.cache.identify({
      id: detailIdToTwigId[links[0].targetId],
      __typename: 'Twig',
    }),
    fragment: FULL_TWIG_FIELDS,
    fragmentName: 'FullTwigFields'
  }) as Twig;


  const [linkI, setLinkI] = useState(0);
  const [clickTimeout, setClickTimeout] = useState(null as ReturnType<typeof setTimeout> | null);

  //const { centerTwig } = useCenterTwig(props.user, props.space);

  // useEffect(() => {
  //   if (links.length > 1) {
  //     const time = 1000 / Math.log(links.length);
  //     const interval = setInterval(() => {
  //       setLinkI(linkI => (linkI + 1) % (links.length));
  //     }, time);
  //     return () => {
  //       clearInterval(interval);
  //     }
  //   }

  // }, [links.length]);

  const center = (postId: string) => {
    //const twigId = subPostIdToTwigId[postId];

    //centerTwig(twigId, true, 0)
  };
  
  const handleMouseDown = (event: React.MouseEvent) => {
    event.stopPropagation();
  }

  const handleClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    dispatch(setSelectArrowId({
      space: props.space,
      arrowId: links[0].id,
    }))
  }

  const rating = 1;
  return (
    <g onClick={handleClick} onMouseDown={handleMouseDown} style={{
      cursor: 'pointer'
    }}>
      <polyline 
        points={getPolylineCoords(
          10 + (20 * (isSelected ? rating + 1 : rating)),
          sourceTwig.x + VIEW_RADIUS,
          sourceTwig.y + VIEW_RADIUS,
          targetTwig.x + VIEW_RADIUS,
          targetTwig.y + VIEW_RADIUS,
        )}
        strokeWidth={2 + (isSelected ? 2 : 0) + rating}
        markerMid={`url(#marker-${links[0]?.userId})`}
        markerEnd={`url(#marker-${links[0]?.userId})`}
      />
      <line 
        style={{
          cursor: 'pointer',
          opacity: 0,
        }}
        x1={sourceTwig.x + VIEW_RADIUS}
        y1={sourceTwig.y + VIEW_RADIUS}
        x2={targetTwig.x + VIEW_RADIUS}
        y2={targetTwig.y + VIEW_RADIUS}
        strokeWidth={10 * (5 + rating)}
        stroke='lavender'
      />
    </g>
  )
}
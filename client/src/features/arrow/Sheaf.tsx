import { useApolloClient } from '@apollo/client';
import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { VIEW_RADIUS } from '../../constants';
import { getPolylineCoords } from '../../utils';
import { SpaceType } from '../space/space';
import { Twig } from '../twig/twig';
import { FULL_TWIG_FIELDS } from '../twig/twigFragments';
import { selectDetailIdToTwigId } from '../twig/twigSlice';
import useCenterTwig from '../twig/useCenterTwig';
import useSelectTwig from '../twig/useSelectTwig';
import { User } from '../user/user';
import { Arrow } from './arrow';
import { selectSelectArrowId, setSelectArrowId } from './arrowSlice';

interface SheafProps {
  user: User;
  abstract: Arrow;
  space: SpaceType;
  links: Arrow[];
  canEdit: boolean;
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

  const { selectTwig } = useSelectTwig(props.space, props.canEdit);
  
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

  
  const handleMouseDown = (event: React.MouseEvent) => {
    event.stopPropagation();
  }

  const handleClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    selectTwig(props.abstract, twigs[0], true)
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
          opacity: isSelected 
            ? .2 
            : .05,
        }}
        x1={sourceTwig.x + VIEW_RADIUS}
        y1={sourceTwig.y + VIEW_RADIUS}
        x2={targetTwig.x + VIEW_RADIUS}
        y2={targetTwig.y + VIEW_RADIUS}
        strokeWidth={10 * ((isSelected ? 4 : 2) + rating)}
        stroke={links[0].user.color}
      />
    </g>
  )
}
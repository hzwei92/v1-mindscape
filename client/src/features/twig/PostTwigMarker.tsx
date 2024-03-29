import React, { useContext } from "react";
import { AppContext } from "../../App";
import { VIEW_RADIUS } from "../../constants";
import { PosType } from "../space/space";
import { SpaceContext } from "../space/SpaceComponent";
import type { Twig } from "./twig";

interface PostTwigMarkerProps {
  twig: Twig;
  pos: PosType;
  parentPos: PosType;
}

function PostTwigMarker(props: PostTwigMarkerProps) {
  const { palette } = useContext(AppContext);
  const { abstract } = useContext(SpaceContext);
  if (
    !props.pos || 
    props.twig.deleteDate || 
    !props.parentPos || 
    props.twig.id === abstract?.rootTwigId
  ) return null;

  return (
    <line 
      x1={props.parentPos.x + VIEW_RADIUS}
      y1={props.parentPos.y + VIEW_RADIUS}
      x2={props.pos.x + VIEW_RADIUS}
      y2={props.pos.y + VIEW_RADIUS}
      stroke={palette === 'dark' ? 'white' : 'black'}
      strokeLinecap={'round'}
      strokeWidth={4}
    />
  )
}

export default React.memo(PostTwigMarker)
import { gql, useMutation, useReactiveVar } from '@apollo/client';
import { sessionVar } from '../../cache';
import { v4 } from 'uuid';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { addEntry, selectIdToEntry, selectNewEntryId, updateEntry } from './entrySlice';
import { Entry } from './entry';
import { useSnackbar } from 'notistack';
import { FULL_ARROW_FIELDS } from '../arrow/arrowFragments';
import { selectCurrentUser } from '../user/userSlice';
import { createArrow } from '../arrow/arrow';
import { mergeArrows, selectArrowById } from '../arrow/arrowSlice';

const REPLY_ARROW = gql`
  mutation ReplyArrow(
    $sessionId: String!, 
    $abstractId: String!,
    $sourceId: String!, 
    $linkId: String! 
    $targetId: String!, 
    $linkDraft: String!
    $targetDraft: String!
  ) {
    replyArrow(
      sessionId: $sessionId, 
      abstractId: $abstractId,
      sourceId: $sourceId, 
      linkId: $linkId,
      targetId: $targetId, 
      linkDraft: $linkDraft,
      targetDraft: $targetDraft
    ) {
      source {
        id
        outCount
      }
      link {
        ...FullArrowFields
      }
      target {
        ...FullArrowFields
      }
    }
  }
  ${FULL_ARROW_FIELDS}
`;

export default function useReplyEntry(entryId: string) {
  const dispatch = useAppDispatch();

  const sessionDetail = useReactiveVar(sessionVar);

  const user = useAppSelector(selectCurrentUser);

  const idToEntry = useAppSelector(selectIdToEntry);
  const newEntryId = useAppSelector(selectNewEntryId);

  const entry = idToEntry[entryId];

  const arrow = useAppSelector(state => selectArrowById(state, entry.arrowId));

  const { enqueueSnackbar } = useSnackbar();
  
  const [reply] = useMutation(REPLY_ARROW, {
    onError: error => {
      console.error(error);
      enqueueSnackbar(error.message);
    },
    onCompleted: data => {
      console.log(data);

      const {
        source,
        link,
        target,
      } = data.replyArrow;

      dispatch(mergeArrows([
        source,
        link,
        target,
      ]));
    },
  });

  const replyEntry = () => {
    if (!user || !user.frame || newEntryId) return;

    const linkId = v4();
    const targetId = v4();

    const linkDraft = JSON.stringify({
      blocks: [{
        key: v4(),
        text: '',
        type: 'unstyled',
        depth: 0,
        inlineStyleRanges: [],
        entityRanges: [],
        data: {},
      }],
      entityMap: {}
    });

    const targetDraft = JSON.stringify({
      blocks: [{
        key: v4(),
        text: '',
        type: 'unstyled',
        depth: 0,
        inlineStyleRanges: [],
        entityRanges: [],
        data: {},
      }],
      entityMap: {}
    });

    reply({
      variables: {
        sessionId: sessionDetail.id,
        abstractId: user.frameId,
        sourceId: entry.arrowId,
        linkId,
        targetId,
        linkDraft,
        targetDraft,
      }
    });
    
    const target = createArrow({
      id: targetId,
      user,
      draft: targetDraft,
      title: null,
      url: null,
      faviconUrl: null,
      abstract: user.frame,
      sheaf: null,
      source: null,
      target: null,
    });

    const link = createArrow({
      id: linkId,
      user,
      draft: linkDraft,
      title: null,
      url: null,
      faviconUrl: null,
      abstract: user.frame,
      sheaf: null,
      source: arrow,
      target,
    });
    
    dispatch(mergeArrows([target, link]));

    const targetEntryId = v4();
    const linkEntryId = v4();

    const targetEntry: Entry = {
      id: targetEntryId,
      userId: user.id,
      parentId: linkEntryId,
      arrowId: targetId,
      showIns: false,
      showOuts: true,
      inIds: [],
      outIds: [],
      sourceId: null,
      targetId: null,
      shouldGetLinks: false,
    };

    const linkEntry: Entry = {
      id: linkEntryId,
      userId: user.id,
      parentId: entryId,
      arrowId: linkId,
      showIns: false,
      showOuts: false,
      inIds: [],
      outIds: [],
      sourceId: entry.id,
      targetId: targetEntryId,
      shouldGetLinks: false,
    };

    dispatch(addEntry(targetEntry));
    dispatch(addEntry(linkEntry));

    dispatch(updateEntry({
      ...idToEntry[entryId],
      showIns: false,
      showOuts: true,
      outIds: [linkEntryId, ...idToEntry[entryId].outIds]
    }));

  };

  return { replyEntry }
}
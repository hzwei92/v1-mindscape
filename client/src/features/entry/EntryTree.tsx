import { Box, Link as MUILink } from '@mui/material';
import React from 'react';
import { LOAD_LIMIT } from '../../constants';
import { useAppSelector } from '../../app/hooks';
import { selectIdToEntry } from './entrySlice';
import { selectIdToArrow } from '../arrow/arrowSlice';
import EntryComponent from './EntryComponent';
import useGetOuts from '../arrow/useGetOuts';
import useGetIns from '../arrow/useGetIns';

interface EntryTreeProps {
  entryId: string;
  depth: number;
}

export default function EntryTree(props: EntryTreeProps) {
  const idToEntry = useAppSelector(selectIdToEntry);
  const entry = idToEntry[props.entryId];
  
  console.log('entry', entry);
  
  const idToArrow = useAppSelector(selectIdToArrow);
  const arrow = idToArrow[entry.arrowId];
  
  const { getIns } = useGetIns(props.entryId, entry?.arrowId);
  const { getOuts } = useGetOuts(props.entryId, entry?.arrowId);

  if (!entry) return null;

  const handleLoadClick = (event: React.MouseEvent) => {
    if (entry.showIns) {
      getIns(entry.inIds.length);
    }
    else if (entry.showOuts) {
      getOuts(entry.outIds.length);
    }
  }

  let remaining = 0;
  let entryIds = [] as string[];

  if (entry.showIns) {
    entryIds = entry.inIds;
    remaining = entryIds.length > 0
      ? Math.min(LOAD_LIMIT, arrow.inCount - entryIds.length)
      : 0;
  }
  else if (entry.showOuts) {
    entryIds = entry.outIds;
    remaining = entryIds.length > 0 
      ? Math.min(LOAD_LIMIT, arrow.outCount - entryIds.length)
      : 0;
  }
  else {
    if (entry.sourceId && entry.sourceId !== entry.parentId) {
      entryIds.push(entry.sourceId);
    }
    else if (entry.targetId && entry.targetId !== entry.parentId) {
      entryIds.push(entry.targetId);
    }
  }

  if (!arrow?.id || arrow.isOpaque) return null;

  return (
    <Box>
      <Box sx={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
      }}>
        <EntryComponent
          entry={entry}
          depth={props.depth}
        />
      </Box>
      <Box sx={{
        borderLeft: `2px solid ${arrow.user.color}`,
        marginLeft: '8px',
      }}>
        {
          entryIds.map(entryId => {
            return (
              <EntryTree
                key={`surveyor-tree-${entryId}`}
                entryId={entryId}
                depth={props.depth + 1}
              />
            )
          })
        }
        {
          remaining > 0
            ? <Box onClick={handleLoadClick} sx={{
                fontSize: 12,
                marginTop: '5px',
                marginLeft: '10px',
                textAlign: 'left',
                cursor: 'pointer',
              }}>
                <MUILink sx={{
                  color: arrow.user.color,
                }}>
                  load {remaining} more
                </MUILink>
              </Box>
            : null
        }
      </Box>
    </Box>
  );
}
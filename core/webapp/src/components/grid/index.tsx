import React, { useEffect, useReducer } from 'react';
import styled from 'styled-components';
import AutoSizer from 'react-virtualized-auto-sizer';

import { useEqualMemo } from 'lib/hooks';
import { defaultState, reducer } from './reducer';
import {
  GridHorizResizeDragHandle,
  GridVertResizeDragHandle,
} from './components/dragHandle';
import { GridCell } from './components/cell';
import { GridRow, GridRowContent } from './components/row';

const Container = styled.div`
  width: 100%;
  height: 100%;

  display: flex;
  flex-direction: column;

  background-color: gray;
  border-radius: 5px;
`;

type GridProps = {
  children?: JSX.Element | JSX.Element[];
  dropAcceptType: string;
};

const GridContainer = ({
  width,
  height,
  children,
  dropAcceptType,
}: {
  height: number;
  width: number;
} & GridProps) => {
  const [state, dispatch] = useReducer(reducer, {
    ...defaultState,
    height,
    width,
  });

  console.log('grid state', state);

  let childKeys: Record<string, true> = {};
  const childrenByKey: Record<string, JSX.Element> = {};

  if (Array.isArray(children)) {
    children.forEach((child) => {
      if (child.key) {
        childKeys[child.key] = true;
        childrenByKey[child.key] = child;
      }
    });
  } else if (children && children.key) {
    childKeys[children.key] = true;
    childrenByKey[children.key] = children;
  }

  const memoChildKeys = useEqualMemo(childKeys);
  useEffect(() => {
    dispatch({ type: 'sync-keys', childKeys: memoChildKeys });
  }, [memoChildKeys]);

  useEffect(() => {
    dispatch({ type: 'resize-height', height });
  }, [height]);
  useEffect(() => {
    dispatch({ type: 'resize-width', width });
  }, [width]);

  return (
    <Container
      style={{
        height,
        width,
      }}
    >
      {state.rows.map((row, idx) => (
        <GridRow
          key={idx}
          rowIndex={idx}
          style={{
            height: height * row.height,
          }}
          dropAcceptType={dropAcceptType}
          isCellAlone={row.cells.length === 1}
          onMove={(data) => {
            dispatch({
              type: 'move-cell-to-new-row',
              ...data,
            });
          }}
        >
          <GridRowContent key="row-content">
            {row.cells.map((cell, cellIdx) => {
              const c = childrenByKey[cell.key];
              return (
                <GridCell
                  key={cell.key}
                  dropAcceptType={dropAcceptType}
                  rowIndex={idx}
                  cellIndex={cellIdx}
                  style={{ width: width * cell.width }}
                  onMove={(data) => {
                    dispatch({
                      type: 'move-cell',
                      ...data,
                    });
                  }}
                >
                  {cellIdx < row.cells.length - 1 ? (
                    <GridVertResizeDragHandle
                      onDragged={(delta) => {
                        dispatch({
                          type: 'resize-cell-width',
                          cellIndex: cellIdx,
                          rowIndex: idx,
                          delta,
                        });
                      }}
                    />
                  ) : null}
                  {typeof c.type === 'string'
                    ? c
                    : React.cloneElement(c, {
                        key: cell.key,
                        rowIndex: idx,
                        cellIndex: cellIdx,
                        isAloneInRow: row.cells.length === 1,
                      })}
                </GridCell>
              );
            })}
          </GridRowContent>
          {idx < state.rows.length - 1 ? (
            <GridHorizResizeDragHandle
              key="row-resize-handle"
              onDragged={(delta) => {
                dispatch({
                  type: 'resize-row-height',
                  rowIndex: idx,
                  delta,
                });
              }}
            />
          ) : null}
        </GridRow>
      ))}
    </Container>
  );
};

export const Grid = (props: GridProps) => {
  return (
    <div style={{ height: '100%', width: '100%' }}>
      <AutoSizer>
        {({ height, width }) => (
          <GridContainer height={height} width={width} {...props} />
        )}
      </AutoSizer>
    </div>
  );
};

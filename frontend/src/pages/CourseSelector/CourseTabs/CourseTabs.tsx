import React, { Suspense } from 'react';
import type { OnDragEndResponder, OnDragStartResponder } from 'react-beautiful-dnd';
import { useDispatch, useSelector } from 'react-redux';
import { DeleteOutlined } from '@ant-design/icons';
import { Popconfirm, Switch, Tooltip } from 'antd';
import DraggableTab from 'components/DraggableTab';
import Spinner from 'components/Spinner';
import type { RootState } from 'config/store';
import { reorderTabs, resetTabs, setActiveTab } from 'reducers/courseTabsSlice';
import { toggleLockedCourses } from 'reducers/settingsSlice';
import S from './styles';

const DragDropContext = React.lazy(() =>
  import('react-beautiful-dnd').then((plot) => ({ default: plot.DragDropContext }))
);
const Droppable = React.lazy(() =>
  import('react-beautiful-dnd').then((plot) => ({ default: plot.Droppable }))
);

const CourseTabs = () => {
  const dispatch = useDispatch();
  const { tabs } = useSelector((state: RootState) => state.courseTabs);
  const { showLockedCourses } = useSelector((state: RootState) => state.settings);

  const handleOnDragStart: OnDragStartResponder = (result) => {
    dispatch(setActiveTab(result.source.index));
  };

  const handleOnDragEnd: OnDragEndResponder = (result) => {
    // dropped outside of tab container
    if (!result.destination) return;

    // reorder tabs logic
    const startIndex = result.source.index;
    const endIndex = result.destination.index;
    const reorderedTabs = Array.from(tabs);
    const [removed] = reorderedTabs.splice(startIndex, 1);
    reorderedTabs.splice(endIndex, 0, removed);

    dispatch(setActiveTab(endIndex));
    dispatch(reorderTabs(reorderedTabs));
  };

  return (
    <S.CourseTabsWrapper>
      <S.ShowAllCourses>
        <S.TextShowCourses>Show all courses</S.TextShowCourses>
        <Switch
          size="small"
          defaultChecked={showLockedCourses}
          onChange={() => dispatch(toggleLockedCourses())}
        />
      </S.ShowAllCourses>
      <Suspense fallback={<Spinner text="Loading tabs..." />}>
        <DragDropContext onDragEnd={handleOnDragEnd} onDragStart={handleOnDragStart}>
          <Droppable droppableId="droppable" direction="horizontal">
            {(droppableProvided) => (
              <S.CourseTabsSection
                ref={droppableProvided.innerRef}
                {...droppableProvided.droppableProps}
              >
                {tabs.map((tab, index) => (
                  <DraggableTab tabName={tab} index={index} />
                ))}
                {droppableProvided.placeholder}
              </S.CourseTabsSection>
            )}
          </Droppable>
        </DragDropContext>
      </Suspense>
      {!!tabs.length && (
        <S.TabsCloseAll>
          <Popconfirm
            placement="bottomRight"
            title="Do you want to close all tabs?"
            onConfirm={() => dispatch(resetTabs())}
            style={{ width: '500px' }}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Close all tabs">
              <DeleteOutlined />
            </Tooltip>
          </Popconfirm>
        </S.TabsCloseAll>
      )}
    </S.CourseTabsWrapper>
  );
};

export default CourseTabs;

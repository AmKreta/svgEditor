import React from 'react';
import Button from '../components/button.component';
import { EditorProps } from './baseShapeEditor';
import { addSvgFilters, editSvgFilter, formatActiveShape, removeSvgFilter } from '../actions/pages/pages.actions';
import { useDispatch, useSelector } from 'react-redux';
import { getInsetShadowDefaultProps, INSET_SHADOW_FILTER } from '../filters/insetShadow.filter';
import generateId from '../utils/idGenerator';
import { FILTER_TYPES } from '../filters/availableFilters';
import { getFiltersOfCurrentPage } from '../selector/selector';
import { State } from '../store/store';
import { AVAILABLE_FILTERS } from '../filters/availableFilters';
import NumberEditor from '../components/valueEditor/numberEditor';
import ColorEditor from '../components/valueEditor/colorEditor';
import { DeleteSpan } from './editorPanel.styles';
import { getOutlineDefaultProps, OUTLINE_FILTER } from '../filters/outline.filter';

const SvgFilterEditor: React.FC<EditorProps> = function ({ shape }) {
    const filtersOfCurrentPage = useSelector<State, { [key: string]: AVAILABLE_FILTERS }>(getFiltersOfCurrentPage);
    const dispatch = useDispatch();

    const addInsetShadow = function () {
        const svgFilters = { ...shape.style.svgFilters };
        const id = FILTER_TYPES.INSET_SHADOW + generateId();
        const filter = getInsetShadowDefaultProps(id);
        if (svgFilters[filter.type]) {
            svgFilters[filter.type]?.push(id);
        }
        else {
            svgFilters[filter.type] = [id];
        }
        dispatch(formatActiveShape({ id:shape.id, style: { svgFilters } }));
        dispatch(addSvgFilters(filter));
    }

    const addOutline = function () {
        const svgFilters = { ...shape.style.svgFilters };
        const id = FILTER_TYPES.OUTLINE + generateId();
        const filter = getOutlineDefaultProps(id);
        if (svgFilters[filter.type]) {
            svgFilters[filter.type]?.push(id);
        }
        else {
            svgFilters[filter.type] = [id];
        }
        dispatch(formatActiveShape({ id:shape.id, style: { svgFilters } }));
        dispatch(addSvgFilters(filter));
    }

    const deleteFilter = function (e: React.MouseEvent<HTMLSpanElement>) {
        const filterId = e.currentTarget.dataset['filterid']!;
        const filterType = e.currentTarget.dataset['filtertype']! as FILTER_TYPES;
        dispatch(removeSvgFilter({ filterId, filterType, shapeId:shape.id }))
    }

    return (
        <div className='EditorCaegoryContainer'>
            <div className='editorCategory'>SVG Filters</div>
            <Button title='+ Add Inset Shadow' onClick={addInsetShadow} />
            {
                shape.style.svgFilters[FILTER_TYPES.INSET_SHADOW]?.map((filterId, idx) => {
                    const filter = filtersOfCurrentPage[filterId] as INSET_SHADOW_FILTER;
                    return (
                        <React.Fragment key={idx + filter.id}>
                            <NumberEditor
                                value={filter?.xOffset || 0}
                                onChange={val => {
                                    dispatch(editSvgFilter({ id: filter.id, newFilter: { ...filter, xOffset: val } }));
                                }}
                                label={
                                    <>
                                        <DeleteSpan className='delete' data-filterid={filter.id} data-filtertype={filter.type} title='Remove' onClick={deleteFilter}>✕</DeleteSpan>
                                        <span>Shadow {idx + 1} · X</span>
                                    </>
                                }
                                step={5}
                            />
                            <NumberEditor
                                value={filter?.yOffset || 0}
                                onChange={val => {
                                    dispatch(editSvgFilter({ id: filter.id, newFilter: { ...filter, yOffset: val } }));
                                }}
                                label={
                                    <>
                                        <DeleteSpan className='delete' data-filterid={filter.id} data-filtertype={filter.type} title='Remove' onClick={deleteFilter}>✕</DeleteSpan>
                                        <span>Shadow {idx + 1} · Y</span>
                                    </>
                                }
                                step={5}
                            />
                            <NumberEditor
                                value={filter?.blur || 0}
                                onChange={val => {
                                    val >= 0 && dispatch(editSvgFilter({ id: filter.id, newFilter: { ...filter, blur: val } }));
                                }}
                                label={
                                    <>
                                        <DeleteSpan className='delete' data-filterid={filter.id} data-filtertype={filter.type} title='Remove' onClick={deleteFilter}>✕</DeleteSpan>
                                        <span>Shadow {idx + 1} · Blur</span>
                                    </>
                                }
                                step={5}
                            />
                            <ColorEditor
                                value={filter?.color || 'rgb(0,0,0)'}
                                onChange={val => {
                                    dispatch(editSvgFilter({ id: filter.id, newFilter: { ...filter, color: val } }));
                                }}
                                label={
                                    <>
                                        <DeleteSpan className='delete' data-filterid={filter.id} data-filtertype={filter.type} title='Remove' onClick={deleteFilter}>✕</DeleteSpan>
                                        <span>Shadow {idx + 1} · Color</span>
                                    </>
                                }
                            />
                        </React.Fragment>
                    );
                })
            }
            <Button title='+ Add Outline' onClick={addOutline} />
            {
                shape.style.svgFilters[FILTER_TYPES.OUTLINE]?.map((filterId, idx) => {
                    const filter = filtersOfCurrentPage[filterId] as OUTLINE_FILTER;
                    return (
                        <React.Fragment key={idx + filter.id}>
                            <NumberEditor
                                value={filter?.radius || 0}
                                onChange={val => {
                                    dispatch(editSvgFilter({ id: filter.id, newFilter: { ...filter, radius: val } }));
                                }}
                                label={
                                    <>
                                        <DeleteSpan className='delete' data-filterid={filter.id} data-filtertype={filter.type} title='Remove' onClick={deleteFilter}>✕</DeleteSpan>
                                        <span>Outline {idx + 1} · Radius</span>
                                    </>
                                }
                                step={5}
                            />
                            <NumberEditor
                                value={filter?.blur || 0}
                                onChange={val => {
                                    dispatch(editSvgFilter({ id: filter.id, newFilter: { ...filter, blur: val } }));
                                }}
                                label={
                                    <>
                                        <DeleteSpan className='delete' data-filterid={filter.id} data-filtertype={filter.type} title='Remove' onClick={deleteFilter}>✕</DeleteSpan>
                                        <span>Outline {idx + 1} · Blur</span>
                                    </>
                                }
                                step={5}
                            />
                            <ColorEditor
                                value={filter?.color || 'rgb(0,0,0)'}
                                onChange={val => {
                                    dispatch(editSvgFilter({ id: filter.id, newFilter: { ...filter, color: val } }));
                                }}
                                label={
                                    <>
                                        <DeleteSpan className='delete' data-filterid={filter.id} data-filtertype={filter.type} title='Remove' onClick={deleteFilter}>✕</DeleteSpan>
                                        <span>Outline {idx + 1} · Fill</span>
                                    </>
                                }
                            />
                        </React.Fragment>
                    );
                })
            }
        </div>
    );
}

export default SvgFilterEditor;

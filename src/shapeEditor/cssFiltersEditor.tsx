import React, { useEffect } from 'react';
import { EditorProps } from './baseShapeEditor';
import styled, { css } from 'styled-components';
import { THEME } from '../theme/theme';
import NumberEditor from '../components/valueEditor/numberEditor';
import ColorEditor from '../components/valueEditor/colorEditor';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { formatActiveShape } from '../actions/pages/pages.actions';
import { CSS_FILTERS } from '../shapes/style';
import { cloneDeep } from 'lodash';
import Button from '../components/button.component';

const defaultDropShadow = {
    xOffset: 0,
    yOffset: 0,
    blur: 0,
    color: 'rgb(0,0,0)'
}

const CssFiltersEditor: React.FC<EditorProps> = function ({ shape }) {

    const [checkedItems, setCheckedItems] = useState<{ [key: string]: boolean }>({});
    const dispatch = useDispatch();

    const toggleChecked = function (e: React.ChangeEvent<HTMLInputElement>) {
        const filter = e.target.dataset['filter'] || '';
        if (filter in checkedItems) {
            // deleting from checked items array
            const newCheckedItems = { ...checkedItems };
            delete newCheckedItems[filter];
            setCheckedItems(newCheckedItems);

            // deleting from objects style
            const newFilterObj = { ...shape.style.cssFilters };
            delete newFilterObj[filter as keyof CSS_FILTERS];
            dispatch(formatActiveShape({ id: shape.id, style: { cssFilters: newFilterObj } }));
        }
        else {
            setCheckedItems((prevState) => ({ ...prevState, [filter]: true }));
        }
    }

    useEffect(function () {
        // to check added filters at the time of mount
        const newCheckedItems: { [key: string]: boolean } = {};
        for (let filter in shape.style.cssFilters) {
            newCheckedItems[filter] = true;
        }
        Object.keys(newCheckedItems).length && setCheckedItems(newCheckedItems);
    }, []);

    const addDropShadow = function () {
        const oldFilters = shape.style.cssFilters;
        if (oldFilters.dropShadow) {
            oldFilters.dropShadow = [...oldFilters?.dropShadow!];
        }
        else {
            oldFilters.dropShadow = [];
        }
        oldFilters.dropShadow.push(defaultDropShadow);
        dispatch(formatActiveShape({ id: shape.id, style: { cssFilters: oldFilters } }))
    }

    const removeDropShadowAtIndex = function (e: React.MouseEvent<HTMLSpanElement>) {
        const index = (e.target as any).dataset['index'];
        if (index || index === 0) {
            const oldFilters = shape.style.cssFilters;
            if (oldFilters.dropShadow?.length) {
                oldFilters.dropShadow?.splice(index, 1);
                oldFilters.dropShadow = cloneDeep(oldFilters.dropShadow);
                const style = { ...shape.style };
                dispatch(formatActiveShape({ id: shape.id, properties: { style } }))
            }
        }
    }

    return (
        <div className='EditorCaegoryContainer'>
            <div className='editorCategory'>CSS Filters</div>
            <NumberEditor
                value={shape.style.cssFilters.blur || 0}
                onChange={val => {
                    if (val >= 0) {
                        const newFilterObj = { ...shape.style.cssFilters };
                        newFilterObj.blur = val;
                        dispatch(formatActiveShape({ id: shape.id, style: { cssFilters: newFilterObj } }));
                    }
                }}
                disabled={!checkedItems['blur']}
                label={
                    <>
                        <Checkbox type='checkbox' checked={checkedItems['blur']} onChange={toggleChecked} data-filter='blur' />
                        <span>Blur</span>
                    </>
                }
            />
            <NumberEditor
                value={shape.style.cssFilters.contrast || 100}
                onChange={val => {
                    if (val >= 0 && val <= 200) {
                        const newFilterObj = { ...shape.style.cssFilters };
                        newFilterObj.contrast = val;
                        dispatch(formatActiveShape({ id: shape.id, style: { cssFilters: newFilterObj } }));
                    }
                }}
                disabled={!checkedItems['contrast']}
                label={
                    <>
                        <Checkbox type='checkbox' checked={checkedItems['contrast']} onChange={toggleChecked} data-filter='contrast' />
                        <span>Contrast</span>
                    </>
                }
                step={10}
            />
            <NumberEditor
                value={shape.style.cssFilters.brightness || 0}
                onChange={val => {
                    if (val >= 0) {
                        const newFilterObj = { ...shape.style.cssFilters };
                        newFilterObj.brightness = val;
                        dispatch(formatActiveShape({ id: shape.id, style: { cssFilters: newFilterObj } }));
                    }
                }}
                disabled={!checkedItems['brightness']}
                label={
                    <>
                        <Checkbox type='checkbox' checked={checkedItems['brightness']} onChange={toggleChecked} data-filter='brightness' />
                        <span>Brightness</span>
                    </>
                }
                step={.05}
            />
            <NumberEditor
                value={shape.style.cssFilters.grayscale || 0}
                onChange={val => {
                    if (val >= 0 && val <= 100) {
                        const newFilterObj = { ...shape.style.cssFilters };
                        newFilterObj.grayscale = val;
                        dispatch(formatActiveShape({ id: shape.id, style: { cssFilters: newFilterObj } }));
                    }
                }}
                disabled={!checkedItems['grayscale']}
                label={
                    <>
                        <Checkbox type='checkbox' checked={checkedItems['grayscale']} onChange={toggleChecked} data-filter='grayscale' />
                        <span>Grayscale</span>
                    </>
                }
                step={10}
            />
            <NumberEditor
                value={shape.style.cssFilters.hueRotate || 0}
                onChange={val => {
                    if (val >= 0 && val <= 360) {
                        const newFilterObj = { ...shape.style.cssFilters };
                        newFilterObj.hueRotate = val;
                        dispatch(formatActiveShape({ id: shape.id, style: { cssFilters: newFilterObj } }));
                    }
                }}
                disabled={!checkedItems['hueRotate']}
                label={
                    <>
                        <Checkbox type='checkbox' checked={checkedItems['hueRotate']} onChange={toggleChecked} data-filter='hueRotate' />
                        <span>Hue Rotate</span>
                    </>
                }
                step={20}
            />
            <NumberEditor
                value={shape.style.cssFilters.invert || 0}
                onChange={val => {
                    if (val >= 0 && val <= 100) {
                        const newFilterObj = { ...shape.style.cssFilters };
                        newFilterObj.invert = val;
                        dispatch(formatActiveShape({ id: shape.id, style: { cssFilters: newFilterObj } }));
                    }
                }}
                disabled={!checkedItems['invert']}
                label={
                    <>
                        <Checkbox type='checkbox' checked={checkedItems['invert']} onChange={toggleChecked} data-filter='invert' />
                        <span>Invert</span>
                    </>
                }
                step={20}
            />
            <NumberEditor
                value={shape.style.cssFilters.opacity || 100}
                onChange={val => {
                    if (val >= 0 && val <= 100) {
                        const newFilterObj = { ...shape.style.cssFilters };
                        newFilterObj.opacity = val;
                        dispatch(formatActiveShape({ id: shape.id, style: { cssFilters: newFilterObj } }));
                    }
                }}
                disabled={!checkedItems['opacity']}
                label={
                    <>
                        <Checkbox type='checkbox' checked={checkedItems['opacity']} onChange={toggleChecked} data-filter='opacity' />
                        <span>Opacity</span>
                    </>
                }
                step={5}
            />
            <NumberEditor
                value={shape.style.cssFilters.saturate || 100}
                onChange={val => {
                    if (val >= 0 && val <= 200) {
                        const newFilterObj = { ...shape.style.cssFilters };
                        newFilterObj.saturate = val;
                        dispatch(formatActiveShape({ id: shape.id, style: { cssFilters: newFilterObj } }));
                    }
                }}
                disabled={!checkedItems['saturate']}
                label={
                    <>
                        <Checkbox type='checkbox' checked={checkedItems['saturate']} onChange={toggleChecked} data-filter='saturate' />
                        <span>Saturate</span>
                    </>
                }
                step={10}
            />
            <NumberEditor
                value={shape.style.cssFilters.sepia || 0}
                onChange={val => {
                    if (val >= 0 && val <= 100) {
                        const newFilterObj = { ...shape.style.cssFilters };
                        newFilterObj.sepia = val;
                        dispatch(formatActiveShape({ id: shape.id, style: { cssFilters: newFilterObj } }));
                    }
                }}
                disabled={!checkedItems['sepia']}
                label={
                    <>
                        <Checkbox type='checkbox' checked={checkedItems['sepia']} onChange={toggleChecked} data-filter='sepia' />
                        <span>Sepia</span>
                    </>
                }
                step={10}
            />
            <Button title='Add Drop-Shadow' onClick={addDropShadow} style={{ margin: 'auto', marginTop: '16px' }} />
            {
                shape.style.cssFilters?.dropShadow?.map((shadow, idx) => (
                    <React.Fragment key={idx + shadow.toString()}>
                        <NumberEditor
                            value={shadow?.xOffset || 0}
                            onChange={val => {
                                if (val || val === 0) {
                                    const newFilterObj = { ...shape.style.cssFilters };
                                    newFilterObj.dropShadow![idx] = { ...defaultDropShadow, ...newFilterObj.dropShadow![idx], xOffset: val };
                                    dispatch(formatActiveShape({ id: shape.id, style: { cssFilters: newFilterObj } }));
                                }
                            }}
                            label={
                                <>
                                    <DeleteSpan className='delete' data-index={idx} title='delete this shadow' onClick={removeDropShadowAtIndex}>❌</DeleteSpan>
                                    <span>s[{idx}] X</span>
                                </>
                            }
                            step={5}
                        />
                        <NumberEditor
                            value={shadow?.yOffset || 0}
                            onChange={val => {
                                if (val || val === 0) {
                                    const newFilterObj = { ...shape.style.cssFilters };
                                    newFilterObj.dropShadow![idx] = { ...defaultDropShadow, ...newFilterObj.dropShadow![idx], yOffset: val };
                                    dispatch(formatActiveShape({ id: shape.id, style: { cssFilters: newFilterObj } }));
                                }
                            }}
                            label={
                                <>
                                    <DeleteSpan className='delete' data-index={idx} title='delete this shadow' onClick={removeDropShadowAtIndex}>❌</DeleteSpan>
                                    <span>s[{idx}] Y</span>
                                </>
                            }
                            step={5}
                        />
                        <NumberEditor
                            value={shadow?.blur || 0}
                            onChange={val => {
                                if (val >= 0 && val <= 200) {
                                    const newFilterObj = { ...shape.style.cssFilters };
                                    newFilterObj.dropShadow![idx] = { ...defaultDropShadow, ...newFilterObj.dropShadow![idx], blur: val };
                                    dispatch(formatActiveShape({ id: shape.id, style: { cssFilters: newFilterObj } }));
                                }
                            }}
                            label={
                                <>
                                    <DeleteSpan className='delete' data-index={idx} title='delete this shadow' onClick={removeDropShadowAtIndex}>❌</DeleteSpan>
                                    <span>s[{idx}] Blur</span>
                                </>
                            }
                            step={5}
                        />
                        <ColorEditor
                            value={shadow?.color || 'rgb(0,0,0)'}
                            onChange={val => {
                                const newFilterObj = { ...shape.style.cssFilters };
                                newFilterObj.dropShadow![idx] = { ...defaultDropShadow, ...newFilterObj.dropShadow![idx], color: val };
                                dispatch(formatActiveShape({ id: shape.id, style: { cssFilters: newFilterObj } }));
                            }}
                            label={
                                <>
                                    <DeleteSpan className='delete' data-index={idx} title='delete this shadow' onClick={removeDropShadowAtIndex}>❌</DeleteSpan>
                                    <span>s[{idx}] Color</span>
                                </>
                            }
                        />
                    </React.Fragment>
                ))
            }
        </div>
    );
}

export default CssFiltersEditor;

const Checkbox = styled.input`
    ${props => {
        const theme = props.theme as THEME;
        return css`
                vertical-align: middle;
                margin-right: ${theme.spacing(.5)}px;
                position:relative;
                bottom:2px;
            }
        `;
    }}
`;

const DeleteSpan = styled.span`
     ${props => {
        const theme = props.theme as THEME;
        return css`
                vertical-align: middle;
                margin-right: ${theme.spacing(.5)}px;
                position:relative;
                bottom:2px;
                font-size: .8em;
                opacity: .7;
                &:hover{
                    cursor: pointer;
                }
            }
        `;
    }}
`;
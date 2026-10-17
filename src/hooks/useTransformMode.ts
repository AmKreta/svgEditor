import { useEffect } from 'react';
import { TRANSFORM_MODE } from '../utils/constant';
import { isEditableKeyboardTarget, setActiveTransformMode } from '../utils/transformMode';

export function useTransformMode() {
    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (isEditableKeyboardTarget(e.target)) {
                return;
            }
            if (e.key === 'Control') {
                setActiveTransformMode(TRANSFORM_MODE.SCALE);
            } else if (e.key === 'Shift') {
                setActiveTransformMode(TRANSFORM_MODE.ROTATE);
            }
        };

        const onKeyUp = (e: KeyboardEvent) => {
            if (e.key === 'Control' || e.key === 'Shift') {
                setActiveTransformMode(TRANSFORM_MODE.TRANSLATE);
            }
        };

        const onBlur = () => setActiveTransformMode(TRANSFORM_MODE.TRANSLATE);

        window.addEventListener('keydown', onKeyDown);
        window.addEventListener('keyup', onKeyUp);
        window.addEventListener('blur', onBlur);
        return () => {
            window.removeEventListener('keydown', onKeyDown);
            window.removeEventListener('keyup', onKeyUp);
            window.removeEventListener('blur', onBlur);
            setActiveTransformMode(TRANSFORM_MODE.TRANSLATE);
        };
    }, []);
}

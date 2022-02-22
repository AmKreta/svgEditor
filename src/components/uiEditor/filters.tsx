import React from 'react';
import { AVAILABLE_FILTERS, FILTER_TYPES } from '../../filters/availableFilters';
import InsetShadow, { INSET_SHADOW_FILTER } from '../../filters/insetShadow.filter';
import Outline, { OUTLINE_FILTER } from '../../filters/outline.filter';
import { getFiltersOfCurrentPage } from '../../selector/selector';
import { useSelector } from 'react-redux';
import { State } from '../../store/store';

const Filters: React.FC = function () {
    const filters = useSelector<State, { [key: string]: AVAILABLE_FILTERS; }>(getFiltersOfCurrentPage);
    return (
        <>
            {
                (function () {
                    const filterList = [];
                    for (let filterId in filters) {
                        switch (filters[filterId].type) {
                            case FILTER_TYPES.INSET_SHADOW: {
                                const f = filters[filterId] as INSET_SHADOW_FILTER;
                                filterList.push(<InsetShadow {...f} key={f.id} />);
                                break;
                            }

                            case FILTER_TYPES.OUTLINE: {
                                const f = filters[filterId] as OUTLINE_FILTER;
                                filterList.push(<Outline {...f} key={f.id} />);
                                break;
                            }

                            default:
                                console.log(filters[filterId] + "doesn't exist");
                                break;
                        }
                    }
                    return filterList;
                })()
            }
        </>
    )
}

export default Filters;
import { LIFE_EXPECTANCY_SET, SET_CURRENT_WEEK} from  "../constants/action-types"

export function lifeExpectancySet(payload){
    return { type: LIFE_EXPECTANCY_SET, payload}
}
export function setCurrentWeek(payload){
    return { type: SET_CURRENT_WEEK, payload}
}
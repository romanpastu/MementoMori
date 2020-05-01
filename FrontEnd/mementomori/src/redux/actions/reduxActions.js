import { LIFE_EXPECTANCY_SET} from  "../constants/action-types"

export function lifeExpectancySet(payload){
    return { type: LIFE_EXPECTANCY_SET, payload}
}
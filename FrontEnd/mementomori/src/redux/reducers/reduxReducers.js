import { LIFE_EXPECTANCY_SET, SET_CURRENT_WEEK} from  "../constants/action-types"

const initialState ={
    lifeExpectancySet : true,
    currentWeek: ""
}

function rootReducer(state= initialState, action){
    switch(action.type){
        case LIFE_EXPECTANCY_SET : {
            return { ...state, lifeExpectancySet: action.payload }
        }
        case SET_CURRENT_WEEK : {
            return {...state , currentWeek: action.payload}
        }
        default:
            return state
    }
    
}

export default rootReducer;
import { LIFE_EXPECTANCY_SET} from  "../constants/action-types"

const initialState ={
    lifeExpectancySet : true
}

function rootReducer(state= initialState, action){
    switch(action.type){
        case LIFE_EXPECTANCY_SET : {
            return { ...state, lifeExpectancySet: action.payload }
        }
        default:
            return state
    }
    
}

export default rootReducer;
import React from 'react'

/**
 * Component that displays some DocsRoutes.
 * 
 * @component
 */

class DocsPage extends React.Component{
    constructor(props){
        super(props)
    }

    render(){
        return <div>
            Api Operations (You must provide your api token as a bearer token in order to obtain access)
            <br></br>
            <br></br>
            Get:
            <br></br>
            - '/user/info' --> Returns the info of your user
        </div>
    }
}
export default DocsPage
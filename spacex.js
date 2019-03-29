(function(){

    const baseUrl = "https://api.spacexdata.com/v3";
    const numberOfLaunches = 20;

    const data = {
        launches: [],
        timeoutId: null
    };

    const config = {

    }

    function getLaunchSuccessData(launch_success, upcoming){
        let launch_success_icon = "";
        let classNameSuccess = "";

        if(upcoming){
            launch_success_icon = "schedule"
            classNameSuccess = "unknown";
        } else if(launch_success === true){
            launch_success_icon = "done"
            classNameSuccess = "successful";          
        } else {
            launch_success_icon = "error"
            classNameSuccess = "failure";
        }

        return {launch_success_icon, classNameSuccess};
    }

    function getVideoElement(youtube_id){
        if(youtube_id){
            return `<iframe width="560" height="315" src="https://www.youtube.com/embed/${youtube_id}" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`
        }else {
            return `
                <div class="not-available">
                    <p>Video isn't available yet !</p>
                </div>
            `
        }

    }

    function handleLauchData(data){
        console.log(data)
        config.output.innerHTML = data
        .sort((a,b)=>b.launch_date_unix - a.launch_date_unix)
        .map(
            ({upcoming, mission_name, launch_success, flight_number, launch_date_utc, links:{youtube_id}, launch_site:{site_name_long}})=>{

                const {classNameSuccess, launch_success_icon} = getLaunchSuccessData(launch_success, upcoming);
                
                return `
                    <div>
                        <div class="header ${classNameSuccess}"><h2>${mission_name}</h2><i class="material-icons">${launch_success_icon}</i></div>
                        <div class="sub-header">
                            <h3>Lauch #${flight_number} <span>${(new Date(launch_date_utc)).toLocaleDateString()}</span></h3>
                        </div>
                        ${getVideoElement(youtube_id)}
                        <div class="footer">
                            <p>${site_name_long}</p>
                        </div>
                    </div>
                `            
        }).join("");
    }
        
    async function loadLaunches(){
        const res = await fetch(`${baseUrl}/launches`)
        return await res.json();
    }

    function search(value){
        const searchText = value.toLocaleLowerCase();
        const res = data.launches.filter(launch=>{
            return JSON.stringify(launch).toLocaleLowerCase().includes(searchText);
        })

        handleLauchData(res);
    }

    function init(){

        console.log("Loading elements");
        config.output = document.getElementById("output");
        const searchEle = document.getElementById("search");
        
        /** listeners */
        searchEle.addEventListener("keyup", function(){
            clearTimeout(data.timeoutId);
            data.timeoutId = setTimeout(()=>{
                search(this.value);
            }, 400);
        });

        console.log("Loading launches");
        loadLaunches()
            .then(res=>{
                data.launches = res;
                handleLauchData(data.launches)
            })
            .catch(err=>console.log(err));
    }

    window.addEventListener("load", init);

})();
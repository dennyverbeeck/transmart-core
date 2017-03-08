package org.transmart.server

class UrlMappings {

    static mappings = {
        "/$controller/$action?/$id?(.$format)?"{
            constraints {
                // apply constraints here
            }
        }

        "/"(controller: 'login', action: 'index')
        "500"(view: '/error')
        "/open-api"(redirect: "/open-api/index.html")


    }
}

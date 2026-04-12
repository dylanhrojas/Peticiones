package com.prayerwall.config;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class SpaForwardingController {

    @RequestMapping(value = {"/globo", "/testimonios", "/nueva", "/login", "/registro", "/mis-peticiones", "/perfil"})
    public String forward() {
        return "forward:/index.html";
    }
}

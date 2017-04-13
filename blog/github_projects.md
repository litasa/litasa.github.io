---
layout: default
title: My Projects
sidebar: page
---

<div id="projects" class="unit-whole">
        {% for project in site.data.projects %}
        <div class="grid" style="padding-top: 50px">
            <div class="card main-color unit-whole">
                <div class="card-content">
                    <h3> {{project.name}} </h3>
                    <p> {{project.description}} </p>
                    <hr class="comment-hr"/>
                   <a class="btn-class btn-github" href="{{ project.link }}" target="_blank">
                       <span class="fa fa-github">
                       </span>
                       View on Github >>
                   </a>
                </div>
            </div>
        </div>
        {% endfor %}
</div>
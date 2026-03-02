"use strict";

function initGlobes() {
  var globes = document.querySelectorAll(".service .globe:not([data-globe-inited])");
  if (!globes.length || !window.globePuffAnimation || !window.worldMapData) return false;

  var width = 400;
  var height = 400;
  var world = window.worldMapData;
  var scrollSpeed = 50;
  var current = 0;
  var λ = d3.scale.linear().domain([0, width]).range([-180, 180]);

  var instances = [];

  globes.forEach(function (globeEl) {
    var puffEl = globeEl.querySelector(".puff");
    var worldmapEl = globeEl.querySelector(".worldmap");
    if (!puffEl || !worldmapEl) return;

    globeEl.setAttribute("data-globe-inited", "1");

    if (typeof bodymovin !== "undefined") {
      bodymovin.loadAnimation({
        container: puffEl,
        renderer: "svg",
        loop: true,
        autoplay: true,
        animationData: window.globePuffAnimation
      });
    }

    var projection = d3.geo.orthographic().scale(200).translate([width / 2, height / 2]).clipAngle(90);
    var path = d3.geo.path().projection(projection);
    var svg = d3.select(worldmapEl).append("svg").attr("width", width).attr("height", height);
    svg.append("path")
      .datum(topojson.feature(world, world.objects.land))
      .attr("class", "land")
      .attr("d", path);

    instances.push({ projection: projection, path: path, svg: svg });
  });

  if (instances.length) {
    function bgscroll() {
      current += 0.5;
      instances.forEach(function (inst) {
        inst.projection.rotate([λ(current), 0]);
        inst.svg.selectAll("path").attr("d", inst.path);
      });
    }
    setInterval(bgscroll, scrollSpeed);
  }
  return instances.length > 0;
}

$(function () {
  var attempts = 0;
  var maxAttempts = 30;
  function tryInit() {
    if (initGlobes()) return;
    attempts += 1;
    if (attempts < maxAttempts) setTimeout(tryInit, 200);
  }
  tryInit();
});

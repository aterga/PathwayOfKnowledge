var sync = 1;

var myCategories = [];
var myArticles = [];
var allNodes={};
var allLinks=[];

function addLink(fromPageID, toPageID)
{
    allLinks.push([fromPageID,toPageID]);
}

function getCategories(title)
{
    while(sync == 0)
    {
        setTimeout(continueExecution, 100) 
    }
    sync=0;
    console.log("getCategories:title: "+ title);
    var wikipediaAPI = "http://en.wikipedia.org/w/api.php?callback=?";
    $.getJSON(wikipediaAPI,{action:"query", titles:title, cllimit:"500",format:"json",prop:"categories"})
        .done(parceToCategories);
    sync=1;
}

function parceToCategories(data)
{
    console.log("parceToCategories:data:");
    console.log(data);
    
    var id = Object.keys(data.query.pages)[0];
    var categories = data.query.pages[id].categories;
    for(var i in categories)
    {
        if(myCategories.indexOf(categories[i].title.substring(9)) != -1)
        {
            return;
        }
    }
    
    var node = {};
    node.id = id;
    node.name = data.query.pages[id].title;
    node.url = "http://en.wikipedia.org/wiki/" + node.name;
    node.tag = categories;
    allNodes[node.id] = node;
    addLink(old_id, id);
}

function continueExecution(){;}

var globalLinks = [];
function getLinks(title,level)
{
    if(level > 1) return;
    console.log("getLinks:title= "+title+", level= "+level);
    globalLinks = [];
    var wikipediaAPI = "http://en.wikipedia.org/w/api.php?callback=?";
    $.getJSON(wikipediaAPI,{action:"query", titles:title, cllimit:"500",format:"json",prop:"links"},
              parseToLinks);
    console.log("getLinks:globalLinks:"+globalLinks);
}

function parseToLinks(data)
{ 
    console.log("parseToLinks, data:");
    console.log(data);
    var id = Object.keys(data.query.pages)[0];
    old_id = id;
    console.log("parseToLinks:id: "+id);
    var _links = data.query.pages[id].links;
    var myLinks = [];
    for(var i in _links)
    {
        myLinks[myLinks.length] = _links[i].title;
    }
    console.log("parseToLinks:myLinks: "+myLinks);
    var filteredLinks = filterFromUnnecesary(myLinks);
}

var globalTitles;
function findAllTitles(searchWord)
{
  globalTitles = [];
  var wikipediaAPI = "http://en.wikipedia.org/w/api.php?&action=opensearch&callback=?";
  $.getJSON(wikipediaAPI,{search: searchWord}, parseToTitles);
  return globalTitles;
}

function parseToTitles(data)
{
    putList(data[1]);
    globalTitles = data[1].join('|');
    console.log(globalTitles);
}

function filterFromUnnecesary(links)
{
    console.log("filterFromUnnecesary:links: "+links);
    var result = [];
    for(i in links)
    {   
        window.setTimeout(20);
        if(isArticleNeed(links[i]))
        {
            result[result.length] = links[i];
        }
    }
    console.log("filtered: "+result);
    return result;
}

function isArticleNeed(title)
{
    console.log("isArticleNeed:title: "+title);
    if(myArticles.indexOf(title) != -1)
    {
        return false;
    }
    getCategories(title);
    console.log("isArticleNeed:" +" must be readed");

    return true;
}

function putList(valueList)
{
    console.log('valueList:'+valueList);
	list_container = document.getElementById("list_confirm");
	for (i in valueList)
    {
        var item = document.createElement('option');
        item.value = item.innerHTML = valueList[i];
        list_container.appendChild(item);
    }
	document.getElementById("confirm_field").setAttribute("style", "display: block;");
}
var node_title;
function buildGraph()
{
    var list_container = document.getElementById("list_confirm");
    node_title = list_container.options[list_container.selectedIndex].value;
    console.log("buildGraph:node_title: "+node_title);
    getLinks(node_title, 0);
    setTimeout(print, 2000);
}
function getGraph()
{
    var graph={};
    graph.nodes = allNodes;
    graph.links = allLinks;
    return graph;
}

function print()
{
   console.log(allNodes);
   var titles = solve(allLinks);
   var arL = document.getElementById("articles_list");
   
   for(var i in titles){
    var link = document.createElement('a');
    link.setAttribute("href", "http://en.wikipedia.org/wiki/" + escape(titles[i]));
    
    var el = document.createElement('div');
    el.setAttribute("class", "article_item");
    el.innerHTML = titles[i];
    link.appendChild(el);
    arL.appendChild(link);
   }
}

function containTitle(title)
{
    var el = document.createElement('div');
    el.setAttribute("class", "article_item");
    el.innerHTML = title;
    return el;
}

function solve(graph){
    console.log(graph);	
    var temp = [];
    var result = [];
    var colours = [];
    
    temp[0] = graph[0][0];
    while (temp.length > 0){
        tek = temp.pop();
                result.push(tek);
        
        var a = getVertexes(graph, tek);

        for(var i = 0; i < a.length; i++){
            if (colours[a[i]] == undefined){
                temp.push(a[i]);
                colours[a[i]] = 1;
            }
        }
    }

    var last = [];
    
    for(var i = 0; i < result.length; i++){
        last.push(result[result.length - 1 - i]);
    }
    return getTitles(last);
}

function getVertexes(b, x){
    var temp = new Array();
    for(var i = 0; i < b.length; i++){
        if (b[i][0] == x) {
            temp.push(b[i][1]);
        }
    }
    return temp;
}
function getTitles(ids){
    var titles = [];
    for(var i in ids)
    {
        if(ids.length - 1 != i){
        console.log(allNodes[ids[i]]);
        titles.push(allNodes[ids[i]].name);}
    }
    titles.push(node_title);

	
	var extra_node = {
		"name": node_title,
		"tag": [],
		"url": "http://"
	};
	
	allNodes[allLinks[0][0]] = extra_node;
	
    draw_graphics();
    
    return titles;
}

<!--
function include(arr,obj) {
    return (arr.indexOf(obj) != -1);
}

function clear_all() {
	var canvas = document.getElementById('canvas');
	var context = canvas.getContext('2d');
	context.clearRect(0, 0, canvas.width, canvas.height);
}

var redraw;
var height = 300;
var width = 800;

/* only do all this when document has finished loading (needed for RaphaelJS */

var draw_graphics = function()
{
    var g = new Graph();
	
 	(function(data) {
		for (var i = 0; i < data.length; i ++) {
			var a = ''+( allNodes[ (data[i][0]) ]  ).name;
			var b = ''+( allNodes[ (data[i][1]) ]  ).name;
			g.addEdge(a, b, { directed : true });
		}
	})(allLinks);
	
	console.log(">>>>>>>>>>>>>>>>>>>>>>>>" + allLinks);

    /* layout the graph using the Spring layout implementation */

    var layouter = new Graph.Layout.Spring(g);

    layouter.layout();

    /* draw the graph using the RaphaelJS draw implementation */

    var renderer = new Graph.Renderer.Raphael('canvas', g, width, height);

    renderer.draw();
    
    redraw = function() {
        layouter.layout();
        renderer.draw();
    };
};
-->
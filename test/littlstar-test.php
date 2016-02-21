<?php 
require_once('littlstar.php');

$apiKey = "2fff3c3bbc5bcf243889aea4f70cb8d1953ec36be2546ebebeda1f47";

$ls = new Littlstar($apiKey);

$photo = $ls->getPhoto($_GET['id']);

echo "<a href=\"".$photo["data"]["versions"]["original"]."\">".$photo["data"]["versions"]["original"]."</a><br />";
echo "<a href=\"".$photo["data"]["versions"]["large"]."\">".$photo["data"]["versions"]["large"]."</a><br />";
echo "<a href=\"".$photo["data"]["versions"]["medium"]."\">".$photo["data"]["versions"]["medium"]."</a><br />";
echo "<a href=\"".$photo["data"]["versions"]["small"]."\">".$photo["data"]["versions"]["small"]."</a><br />";
echo "<a href=\"".$photo["data"]["versions"]["thumbnail"]."\">".$photo["data"]["versions"]["thumbnail"]."</a><br />";


?>
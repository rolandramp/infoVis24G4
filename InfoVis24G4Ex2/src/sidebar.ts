import * as d3 from 'd3';
import { fetchCities, fetchCountries, init_db, fetchDataByCityAndCountry } from "./queries";
import { world_map } from "./world_map";

const sidebar = document.querySelector("#sidebar")!;
const app = document.querySelector("#app")!;

// Initialize the database
await init_db();

// Create the world map and append it to the app
const worldMap = world_map();
app.appendChild(worldMap.element);

// Create a slider for the beginning year
const begin_year_slider = d3.select(sidebar).append('input')
  .attr('type', 'range')
  .attr('min', '1902')
  .attr('max', '1916')
  .attr('value', '50')
  .attr('step', '1')
  .style('width', '100%');

// Create a span to display the begin_year_slider value
const begin_year_silderValue = d3.select(sidebar).append('span')
  .style('margin-left', '10px')
  .text(begin_year_slider.property('value'));

// Update the span text when the begin_year_slider value changes
begin_year_slider.on('input', function() {
  const value = d3.select(this).property('value');
  begin_year_silderValue.text(value);
  console.log('Slider value:', value);
});

// Create a slider for the end year
const end_year_slider = d3.select(sidebar).append('input')
  .attr('type', 'range')
  .attr('min', '1902')
  .attr('max', '1916')
  .attr('value', '50')
  .attr('step', '1')
  .style('width', '100%');

// Create a span to display the end_year_slider value
const end_year_silderValue = d3.select(sidebar).append('span')
  .style('margin-left', '10px')
  .text(end_year_slider.property('value'));

// Update the span text when the end_year_slider value changes
end_year_slider.on('input', function() {
  const value = d3.select(this).property('value');
  end_year_silderValue.text(value);
  console.log('Slider value:', value);
});

// Create a group for the exhibition type checkboxes
const exhibition_type_checkboxGroup = d3.select(sidebar).append('div').attr('id', 'exhibition_type_checkboxGroup');

// Create the solo exhibition checkbox
const solo_checkbox = exhibition_type_checkboxGroup.append('input')
  .attr('type', 'checkbox')
  .attr('id', 'solo_checkbox_id');
exhibition_type_checkboxGroup.append('label')
  .attr('for', 'solo_checkbox_id')
  .text('Solo');

// Create the group exhibition checkbox
const group_checkbox = exhibition_type_checkboxGroup.append('input')
  .attr('type', 'checkbox')
  .attr('id', 'group_checkbox_id');
exhibition_type_checkboxGroup.append('label')
  .attr('for', 'group_checkbox_id')
  .text('Group');

// Create the auction checkbox
const auction_checkbox = exhibition_type_checkboxGroup.append('input')
  .attr('type', 'checkbox')
  .attr('id', 'auction_checkbox_id');
exhibition_type_checkboxGroup.append('label')
  .attr('for', 'auction_checkbox_id')
  .text('Auction');

// Add event listeners to the exhibition type checkboxes
solo_checkbox.on('change', function() {
  const isChecked = d3.select(this).property('checked');
  console.log('Checkbox 1 is checked:', isChecked);
});

group_checkbox.on('change', function() {
  const isChecked = d3.select(this).property('checked');
  console.log('Checkbox 2 is checked:', isChecked);
});

auction_checkbox.on('change', function() {
  const isChecked = d3.select(this).property('checked');
  console.log('Checkbox 3 is checked:', isChecked);
});

// Create a group for the gender checkboxes
const gender_checkboxGroup = d3.select(sidebar).append('div').attr('id', 'gender_checkboxGroup');

// Create the male checkbox
const male_checkbox = gender_checkboxGroup.append('input')
  .attr('type', 'checkbox')
  .attr('id', 'male_checkbox_id');
gender_checkboxGroup.append('label')
  .attr('for', 'male_checkbox_id')
  .text('Male');

// Create the female checkbox
const female_checkbox = gender_checkboxGroup.append('input')
  .attr('type', 'checkbox')
  .attr('id', 'female_checkbox_id');
gender_checkboxGroup.append('label')
  .attr('for', 'female_checkbox_id')
  .text('Female');

// Add event listeners to the gender checkboxes
male_checkbox.on('change', function() {
  const isChecked = d3.select(this).property('checked');
  console.log('Male checkbox is checked:', isChecked);
});

female_checkbox.on('change', function() {
  const isChecked = d3.select(this).property('checked');
  console.log('Female checkbox is checked:', isChecked);
});

// Create a label for the country select box
d3.select(sidebar).append('label')
  .attr('for', 'country_select_box_id')
  .text('Select Country:');

// Create a select box for countries
const country_select_box = d3.select(sidebar).append('select')
  .attr('id', 'country_select_box_id');

// Fetch and add options to the country select box
const countries = await fetchCountries();
for (const country of countries) {
  country_select_box.append('option')
    .attr('value', country['e.country'])
    .text(country['e.country']);
}

// Add an event listener to the country select box
country_select_box.on('change', async function() {
  const country = country_select_box.property("value");

  // Fetch and update the city options based on the selected country
  const cities = await fetchCities(country);
  city_select_box.selectAll('option').remove();
  for (const city of cities) {
    city_select_box.append('option')
      .attr('value', city['e.city'])
      .text(city['e.city']);
  }

  const city = city_select_box.property("value");
  // Update coordinates based on the new selection
  update_coordinates(city, country);
  console.log('Selected value:', country);
});

// Create a label for the city select box
d3.select(sidebar).append('label')
  .attr('for', 'city_select_box_id')
  .text('Select City:');

// Create a select box for cities
const city_select_box = d3.select(sidebar).append('select')
  .attr('id', 'city_select_box_id');

// Fetch and add options to the city select box
let cities = await fetchCities('AT');
for (const city of cities) {
  city_select_box.append('option')
    .attr('value', city['e.city'])
    .text(city['e.city']);
}

// Add an event listener to the city select box
city_select_box.on('change', function() {
  const city = city_select_box.property("value");
  const country = country_select_box.property("value");
  update_coordinates(city, country);
  console.log('Selected city:', city);
});

// Function to update coordinates based on selected city and country
async function update_coordinates(city: string = 'Vienna', country: string = 'AT') {
  try {
    // Fetch data by city and country
    const data = await fetchDataByCityAndCountry(city, country);
    const latitudes = data.getChild("e.latitude")!.toJSON();
    const longitudes = data.getChild("e.longitude")!.toJSON();

    // Map the latitude and longitude values into an array of objects
    const coordinates = latitudes.map((lat, index) => ({
      latitude: lat,
      longitude: longitudes[index]
    }));

    // Update the world map with all the new coordinates
    worldMap.update(coordinates);
  } catch (error) {
    // Handle any errors that occur during the fetch or update process
    console.error("Error updating coordinates:", error);
  }
}
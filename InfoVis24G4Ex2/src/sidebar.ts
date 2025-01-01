import * as d3 from 'd3';
import { fetchCities, fetchCountries, init_db } from "./queries";

const sidebar = document.querySelector("#sidebar")!;

await init_db();

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

const end_year_slider = d3.select(sidebar).append('input')
  .attr('type', 'range')
  .attr('min', '1902')
  .attr('max', '1916')
  .attr('value', '50')
  .attr('step', '1')
  .style('width', '100%');

// Create a span to display the begin_year_slider value
const end_year_silderValue = d3.select(sidebar).append('span')
  .style('margin-left', '10px')
  .text(begin_year_slider.property('value'));

// Update the span text when the begin_year_slider value changes
end_year_slider.on('input', function() {
  const value = d3.select(this).property('value');
  end_year_silderValue.text(value);
  console.log('Slider value:', value);
});


// Create a group for the checkboxes
const exhibition_type_checkboxGroup = d3.select(sidebar).append('div').attr('id', 'exhibition_type_checkboxGroup');

// Create the first checkbox
const solo_checkbox = exhibition_type_checkboxGroup.append('input')
  .attr('type', 'checkbox')
  .attr('id', 'solo_checkbox_id');
exhibition_type_checkboxGroup.append('label')
  .attr('for', 'solo_checkbox_id')
  .text('Solo');

// Create the second checkbox
const group_checkbox = exhibition_type_checkboxGroup.append('input')
  .attr('type', 'checkbox')
  .attr('id', 'group_checkbox_id');
exhibition_type_checkboxGroup.append('label')
  .attr('for', 'group_checkbox_id')
  .text('Group');

// Create the third checkbox
const auction_checkbox = exhibition_type_checkboxGroup.append('input')
  .attr('type', 'checkbox')
  .attr('id', 'auction_checkbox_id');
exhibition_type_checkboxGroup.append('label')
  .attr('for', 'auction_checkbox_id')
  .text('Auction');

// Add event listeners to the checkboxes
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


// Create a group for the checkboxes
const gender_checkboxGroup = d3.select(sidebar).append('div').attr('id', 'gender_checkboxGroup');

// Create the first checkbox
const male_checkbox = exhibition_type_checkboxGroup.append('input')
  .attr('type', 'checkbox')
  .attr('id', 'male_checkbox_id');
gender_checkboxGroup.append('label')
  .attr('for', 'male_checkbox_id')
  .text('Male');

// Create the second checkbox
const female_checkbox = exhibition_type_checkboxGroup.append('input')
  .attr('type', 'checkbox')
  .attr('id', 'female_checkbox_id');
gender_checkboxGroup.append('label')
  .attr('for', 'female_checkbox_id')
  .text('Female');


// Add event listeners to the checkboxes
male_checkbox.on('change', function() {
  const isChecked = d3.select(this).property('checked');
  console.log('Male checkbox is checked:', isChecked);
});

female_checkbox.on('change', function() {
  const isChecked = d3.select(this).property('checked');
  console.log('Female checkbox is checked:', isChecked);
});

// Create a label for the select box
d3.select(sidebar).append('label')
  .attr('for', 'country_select_box_id')
  .text('Select Country:');

// Create a select box
const country_select_box = d3.select(sidebar).append('select')
  .attr('id', 'country_select_box_id');

// Add options to the select box
const countries = await fetchCountries()

for (const country of countries) {
  country_select_box.append('option')
    .attr('value', country)
    .text(country['e.country']);
}

// Add an event listener to the select box
country_select_box.on('change', function() {
  const selectedValue = d3.select(this).property('value');
  console.log('Selected value:', selectedValue);
});

// Create a label for the select box
d3.select(sidebar).append('label')
  .attr('for', 'city_select_box_id')
  .text('Select City:');

// Create a select box
const city_select_box = d3.select(sidebar).append('select')
  .attr('id', 'city_select_box_id');

// Add options to the select box

const cities = await fetchCities();
for (const city of cities) {
  city_select_box.append('option')
    .attr('value', city)
    .text(city['e.city']);
}

// Add an event listener to the select box
city_select_box.on('change', function() {
  const selectedValue = d3.select(this).property('value');
  console.log('Selected city:', selectedValue);
});



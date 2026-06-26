# bp-entry-card

## Save Action

By default, the card saves readings with the `blood_pressure.add_sample` service.

To run a Home Assistant script instead, set either `save_script` or `script` in the card config:

```yaml
type: custom:bp-entry-card
save_script: script.log_blood_pressure
```

The card also accepts bare script names and normalizes them to `script.<name>`.
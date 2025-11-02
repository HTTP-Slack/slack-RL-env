import { Section } from "../models/section.model.js";
import Organisation from "../models/organisation.model.js";
import Channel from "../models/channel.model.js";

export const createSection = async (req, res) => {
  try {
    const { name, organisationId } = req.body;
    const createdBy = req.user._id;

    if (!name || !organisationId) {
      return res
        .status(400)
        .json({ error: "Name and organisationId are required" });
    }

    const organisation = await Organisation.findById(organisationId);
    if (!organisation) {
      return res.status(404).json({ error: "Organisation not found" });
    }

    const section = await Section.create({
      name,
      organisation: organisationId,
      createdBy,
    });

    organisation.sections.push(section._id);
    await organisation.save();

    res.status(201).json(section);
  } catch (error) {
    console.error("Error in createSection: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getSections = async (req, res) => {
  try {
    const { organisationId } = req.query;
    let sections = await Section.find({ organisation: organisationId })
      .populate("channels")
      .sort("order");
    
    // If no sections exist, create a default "Channels" section
    if (sections.length === 0) {
      const organisation = await Organisation.findById(organisationId);
      if (organisation) {
        const defaultSection = await Section.create({
          name: 'Channels',
          organisation: organisationId,
          createdBy: organisation.owner,
          order: 0,
        });
        
        // Add section to organisation
        organisation.sections = [defaultSection._id];
        await organisation.save();
        
        // Populate and return the new section
        sections = [await Section.findById(defaultSection._id).populate("channels")];
      }
    }
    
    res.status(200).json(sections);
  } catch (error) {
    console.error("Error in getSections: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateSectionOrder = async (req, res) => {
  try {
    const { orderedSectionIds } = req.body;
    const updates = orderedSectionIds.map((id, index) =>
      Section.findByIdAndUpdate(id, { order: index })
    );
    await Promise.all(updates);
    res.status(200).json({ message: "Section order updated successfully" });
  } catch (error) {
    console.error("Error in updateSectionOrder: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateChannelOrder = async (req, res) => {
  try {
    const { sourceSectionId, destSectionId, sourceChannelIds, destChannelIds } =
      req.body;

    await Section.findByIdAndUpdate(sourceSectionId, {
      channels: sourceChannelIds,
    });
    if (sourceSectionId !== destSectionId) {
      await Section.findByIdAndUpdate(destSectionId, {
        channels: destChannelIds,
      });
    }

    // Update section for moved channels
    const destSection = await Section.findById(destSectionId);
    await Channel.updateMany(
      { _id: { $in: destChannelIds } },
      { section: destSection._id }
    );

    res.status(200).json({ message: "Channel order updated successfully" });
  } catch (error) {
    console.error("Error in updateChannelOrder: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteSection = async (req, res) => {
  try {
    const { id } = req.params;
    const section = await Section.findById(id);
    if (!section) {
      return res.status(404).json({ error: "Section not found" });
    }

    // Remove section from organisation
    await Organisation.findByIdAndUpdate(section.organisation, {
      $pull: { sections: id },
    });

    // Potentially move channels to a default section or handle them otherwise
    // For now, we'll just delete the section
    await Section.findByIdAndDelete(id);

    res.status(200).json({ message: "Section deleted successfully" });
  } catch (error) {
    console.error("Error in deleteSection: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
